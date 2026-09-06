import fs from "node:fs/promises";
import path from "node:path";

const base = process.env.CAPTAIN_API_URL || "https://captain.sapimu.au";
const jsonCandidates = ["/openapi.json", "/swagger.json", "/swagger/v1/swagger.json", "/api-docs"];
const htmlCandidates = ["/swagger"];
const outDir = path.join(process.cwd(), "data", "swagger");
const currentFile = path.join(outDir, "captain-current.json");
const diffFile = path.join(outDir, "captain-diff.json");
const registryFile = path.join(outDir, "captain-registry.json");

function operations(doc) {
  const result = new Map();
  for (const [route, item] of Object.entries(doc.paths || {})) {
    for (const method of ["get", "post", "put", "patch", "delete", "head", "options"]) {
      const op = item?.[method];
      if (!op) continue;
      const id = op.operationId || `${method.toUpperCase()} ${route}`;
      result.set(id, {
        id,
        method: method.toUpperCase(),
        route,
        tags: op.tags || [],
        summary: op.summary || "",
        parameters: [...(item.parameters || []), ...(op.parameters || [])].map((p) => ({
          name: p.name,
          in: p.in,
          required: Boolean(p.required),
        })),
      });
    }
  }
  return result;
}

function tryParseEmbeddedSpec(html) {
  const markers = ["openapi", "swagger"];
  for (const marker of markers) {
    let cursor = 0;
    while ((cursor = html.indexOf(`\"${marker}\"`, cursor)) !== -1) {
      const start = html.lastIndexOf("{", cursor);
      if (start < 0) break;
      let depth = 0;
      let quoted = false;
      let escaped = false;
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

async function fetchSpec() {
  const headers = { Accept: "application/json, text/html;q=0.9, */*;q=0.8", "User-Agent": "Mozilla/5.0 DRACIN-Swagger-Watch/2.0" };
  for (const candidate of jsonCandidates) {
    try {
      const response = await fetch(`${base}${candidate}`, { headers });
      if (!response.ok) continue;
      const json = JSON.parse(await response.text());
      if (json?.paths) return { json, source: candidate };
    } catch {}
  }
  for (const candidate of htmlCandidates) {
    try {
      const response = await fetch(`${base}${candidate}`, { headers });
      if (!response.ok) continue;
      const json = tryParseEmbeddedSpec(await response.text());
      if (json?.paths) return { json, source: `${candidate} (embedded)` };
    } catch {}
  }
  throw new Error(`Unable to fetch Captain OpenAPI from ${base}`);
}

await fs.mkdir(outDir, { recursive: true });
let previous = null;
try { previous = JSON.parse(await fs.readFile(currentFile, "utf8")); } catch {}

const { json: current, source } = await fetchSpec();
const oldOps = operations(previous || {});
const newOps = operations(current);
const added = [...newOps.keys()].filter((id) => !oldOps.has(id)).map((id) => newOps.get(id));
const removed = [...oldOps.keys()].filter((id) => !newOps.has(id)).map((id) => oldOps.get(id));
const changed = [...newOps.keys()].filter((id) => {
  const before = oldOps.get(id); const after = newOps.get(id);
  return before && JSON.stringify(before) !== JSON.stringify(after);
}).map((id) => ({ before: oldOps.get(id), after: newOps.get(id) }));
const providers = [...new Set([...newOps.values()].flatMap((op) => op.tags))].sort();
const registry = [...newOps.values()].sort((a, b) => a.id.localeCompare(b.id));
const diff = { checkedAt: new Date().toISOString(), source, previousOperations: oldOps.size, currentOperations: newOps.size, providers: providers.length, added, removed, changed };
await fs.writeFile(currentFile, JSON.stringify(current, null, 2));
await fs.writeFile(registryFile, JSON.stringify(registry, null, 2));
await fs.writeFile(diffFile, JSON.stringify(diff, null, 2));
console.log(JSON.stringify(diff, null, 2));
