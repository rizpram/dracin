import { NextRequest, NextResponse } from "next/server";

const baseUrl = process.env.CAPTAIN_API_URL ?? "https://captain.sapimu.au";

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const token = process.env.CAPTAIN_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "CAPTAIN_API_TOKEN is not configured" }, { status: 503 });
  }

  const { path } = await context.params;
  const upstream = new URL(path.join("/"), `${baseUrl.replace(/\/$/, "")}/`);
  request.nextUrl.searchParams.forEach((value, key) => upstream.searchParams.append(key, value));

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");
  headers.set("User-Agent", "Mozilla/5.0 DRACIN/1.0");
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const method = request.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : await request.text();

  try {
    const response = await fetch(upstream, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(Number(process.env.CAPTAIN_TIMEOUT_MS ?? 20000))
    });

    const responseBody = await response.arrayBuffer();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store"
      }
    });
  } catch {
    return NextResponse.json({ error: "Captain upstream unavailable" }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
