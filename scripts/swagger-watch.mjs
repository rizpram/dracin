import fs from "node:fs/promises";
import path from "node:path";

const base = process.env.CAPTAIN_API_URL || "https://captain.sapimu.au";
const candidates = ["/openapi.json", "/swagger.json", "/swagger/v1/swagger.json", "/api-docs"];
const outDir = path.join(process.cwd(), "data", "swagger");
const currentFile = path.join(outDir, "captain-current.json");
const diffFile = path.join(outDir, "captain-diff.json");

function operations(doc) {
  const result = new Map();
  for (const [route, item] of Object.entries(doc.paths || {})) {
    for (const method of ["get", "post", "put", "patch", "delete", "head", "options"]) {
      const op = item?.[method];
      if (!op) continue;
      const id = op.operationId || `${method.toUpperCase()} ${route}`;
      result.set(id, { id, method: method.toUpperCase(), route, tags: op.tags || [] });
    }
  }
  return result;
}

async function fetchSpec() {
  for (const candidate of candidates) {
    try {
      const response = await fetch(`${base}${candidate}`, { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 DRACIN-Swagger-Watch/1.0" } });
      if (!response.ok) continue;
      const text = await response.text();
      const json = JSON.parse(text);
      if (json?.paths) return { json, source: candidate };
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
const diff = { checkedAt: new Date().toISOString(), source, previousOperations: oldOps.size, currentOperations: newOps.size, providers: providers.length, added, removed, changed };
await fs.writeFile(currentFile, JSON.stringify(current, null, 2));
await fs.writeFile(diffFile, JSON.stringify(diff, null, 2));
console.log(JSON.stringify(diff, null, 2));
