import { NextResponse } from "next/server";
import { providerFetch } from "@/lib/providers";

type JsonRecord = Record<string, any>;

const JSON_CANDIDATES = ["/openapi.json", "/swagger.json", "/swagger/v1/swagger.json", "/api-docs"];
const UNSAFE = /(unlock|bypass|decrypt|decrypted|terdekripsi|drm|paywall|premium|\bvip\b|berbayar|locked\s*content)/i;

function embeddedSpec(html: string): JsonRecord | null {
  for (const marker of ["openapi", "swagger"]) {
    let cursor = 0;
    while ((cursor = html.indexOf(`\"${marker}\"`, cursor)) !== -1) {
      const start = html.lastIndexOf("{", cursor);
      if (start < 0) break;
      let depth = 0, quoted = false, escaped = false;
      for (let i = start; i < html.length; i++) {
        const ch = html[i];
        if (quoted) {
          if (escaped) escaped = false;
          else if (ch === "\\") escaped = true;
          else if (ch === '"') quoted = false;
          continue;
        }
        if (ch === '"') quoted = true;
        else if (ch === "{") depth++;
        else if (ch === "}" && --depth === 0) {
          try {
            const parsed = JSON.parse(html.slice(start, i + 1));
            if (parsed?.paths && (parsed.openapi || parsed.swagger)) return parsed;
          } catch {}
          break;
        }
      }
      cursor += marker.length + 2;
    }
  }
  return null;
}

async function loadSpec(): Promise<{ spec: JsonRecord; source: string }> {
  for (const path of JSON_CANDIDATES) {
    try {
      const res = await providerFetch("captain", path);
      if (!res.ok) continue;
      const json = await res.json();
      if (json?.paths) return { spec: json, source: path };
    } catch {}
  }
  const res = await providerFetch("captain", "/swagger");
  if (!res.ok) throw new Error(`Captain Swagger ${res.status}`);
  const spec = embeddedSpec(await res.text());
  if (!spec) throw new Error("Embedded OpenAPI spec not found");
  return { spec, source: "/swagger (embedded)" };
}

function intentFor(route: string, summary: string, operationId: string) {
  const s = `${route} ${summary} ${operationId}`.toLowerCase();
  if (/(play|stream|video|m3u8)/.test(s)) return "play";
  if (/(episode|chapter)/.test(s)) return "episodes";
  if (/(detail|info|subject|book)/.test(s)) return "detail";
  if (/(search|query)/.test(s)) return "search";
  if (/(home|feed|recommend|rank|trending|popular|foryou|for-you|latest|new)/.test(s)) return "feed";
  return "other";
}

export async function GET() {
  try {
    const { spec, source } = await loadSpec();
    const operations: any[] = [];
    for (const [route, pathItem] of Object.entries<any>(spec.paths || {})) {
      for (const method of ["get", "post", "put", "patch", "delete"]) {
        const op = pathItem?.[method];
        if (!op) continue;
        const operationId = op.operationId || `${method.toUpperCase()} ${route}`;
        const tags = op.tags || [];
        const summary = op.summary || "";
        const unsafe = UNSAFE.test(`${route} ${summary} ${operationId}`);
        operations.push({
          operationId,
          method: method.toUpperCase(),
          route,
          provider: tags[0] || "Untagged",
          tags,
          summary,
          intent: intentFor(route, summary, operationId),
          unsafe,
          parameters: [...(pathItem.parameters || []), ...(op.parameters || [])].map((p: any) => ({ name: p.name, in: p.in, required: !!p.required })),
        });
      }
    }
    const providers = [...new Set(operations.flatMap((o) => o.tags))].sort();
    const safe = operations.filter((o) => !o.unsafe);
    const providerSummary = providers.map((provider) => {
      const ops = safe.filter((o) => o.tags.includes(provider));
      return {
        provider,
        endpoints: ops.length,
        intents: Object.fromEntries(["feed", "search", "detail", "episodes", "play", "other"].map((intent) => [intent, ops.filter((o) => o.intent === intent).length])),
      };
    });
    return NextResponse.json({
      source,
      openapi: spec.openapi || spec.swagger || null,
      providers: providers.length,
      endpoints: operations.length,
      safeEndpoints: safe.length,
      excludedUnsafe: operations.filter((o) => o.unsafe).map((o) => ({ operationId: o.operationId, method: o.method, route: o.route, provider: o.provider })),
      providerSummary,
      operations: safe,
    }, { headers: { "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load Captain registry" }, { status: 502 });
  }
}
