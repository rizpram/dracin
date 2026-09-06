import { NextRequest, NextResponse } from "next/server";
import { cachedProviderRequest } from "@/lib/provider-cache";
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
    if (method === "GET") {
      const result = await cachedProviderRequest(provider, upstreamPath, () =>
        providerFetch(provider, upstreamPath, { method: "GET" }),
      );

      return new NextResponse(result.body, {
        status: result.status,
        headers: {
          "content-type": result.contentType,
          "cache-control": `public, max-age=60, s-maxage=${result.ttlSeconds}, stale-while-revalidate=300`,
          "x-dracin-cache": result.cacheStatus,
          "x-dracin-provider": provider,
        },
      });
    }

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
        "x-dracin-cache": "BYPASS",
        "x-dracin-provider": provider,
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
