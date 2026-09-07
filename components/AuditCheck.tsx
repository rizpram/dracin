"use client";

import { useState } from "react";

type AuditResult = {
  ok?: boolean;
  catalog?: { ok?: boolean; count?: number };
  detail?: { ok?: boolean };
  episodes?: { ok?: boolean; count?: number };
  play?: { ok?: boolean; tested?: boolean; type?: string | null };
  error?: string;
};

export function AuditCheck({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<AuditResult | null>(null);

  async function run() {
    if (state === "loading") return;
    setState("loading");
    try {
      const response = await fetch(`/api/audit/provider?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({ ok: false, error: `HTTP ${response.status}` }));
      setResult(data);
    } catch (error) {
      setResult({ ok: false, error: error instanceof Error ? error.message : "Audit gagal" });
    } finally {
      setState("done");
    }
  }

  if (state === "idle") return <button className="audit-run" onClick={run}>Cek live</button>;
  if (state === "loading") return <button className="audit-run" disabled>Memeriksa…</button>;

  return (
    <div className="audit-result-inline">
      <button className="audit-run" onClick={run}>Ulangi</button>
      <span className={result?.catalog?.ok ? "ok" : "bad"}>K {result?.catalog?.count ?? 0}</span>
      <span className={result?.detail?.ok ? "ok" : "bad"}>D</span>
      <span className={result?.episodes?.ok ? "ok" : "bad"}>E {result?.episodes?.count ?? 0}</span>
      <span className={result?.play?.ok ? "ok" : result?.play?.tested ? "bad" : "muted"}>P</span>
      {result?.error ? <small>{result.error}</small> : null}
    </div>
  );
}
