import { NextRequest, NextResponse } from "next/server";
import { providerFetch, type ProviderName } from "@/lib/providers";

const allowedProviders = new Set<ProviderName>(["captain", "sansekai"]);

function resolveProvider(value: string): ProviderName | null {
  return allowedProviders.has(value as ProviderName) ? (value as ProviderName) : null;
}

async function forward(request: NextRequest, params: Promise<{ provider: string; path: string[] }>) {
  const { provider: rawProvider, path } = await params;
  const provider = resolveProvider(rawProvider);
  if (!provider) return NextResponse.json({ error: "Unknown provider" }, { status: 404 });

  const upstreamPath = `/${path.join("/")}${request.nextUrl.search}`;
  const method = request.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : await request.text();

  try {
    const response = await providerFetch(provider, upstreamPath, {
      method,
      body,
      headers: request.headers.get("content-type")
        ? { "content-type": request.headers.get("content-type")! }
        : undefined,
    });

    const contentType = response.headers.get("content-type") || "application/json";
    const payload = await response.arrayBuffer();

    return new NextResponse(payload, {
      status: response.status,
      headers: {
        "content-type": contentType,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Provider unavailable", provider, detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string; path: string[] }> }) {
  return forward(request, context.params);
}

export async function POST(request: NextRequest, context: { params: Promise<{ provider: string; path: string[] }> }) {
  return forward(request, context.params);
}
