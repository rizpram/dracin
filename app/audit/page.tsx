import Link from "next/link";
import { PROVIDER_DIRECTORY } from "@/lib/provider-directory";

export default function AuditPage(){
  return <main className="app-shell"><div className="mobile-frame audit-page">
    <header className="mobile-topbar"><Link href="/" className="back-link">‹</Link><div className="brand">AUDIT</div><span className="status-pill">LIVE</span></header>
    <section className="home-section provider-page">
      <div className="provider-heading"><span className="kicker">Health Check</span><h1>Provider Audit</h1><p>Tap satu provider untuk cek katalog, detail, episode, dan safe playback secara live. Audit dibuat per-provider supaya tidak membanjiri Captain dan tidak menabrak limit Sansekai 10 request/menit.</p></div>
      <div className="audit-list">
        {PROVIDER_DIRECTORY.map((p)=><div className="audit-row" key={p.slug}>
          <div><span className={`source-dot ${p.source}`} /><strong>{p.name}</strong><small>{p.source === "captain" ? "Captain primary" : "Sansekai fallback"}</small></div>
          <div className="audit-actions"><Link href={`/provider/${p.slug}`}>Buka</Link><Link href={`/api/audit/provider?slug=${p.slug}`}>Audit live</Link></div>
        </div>)}
      </div>
    </section>
    <nav className="mobile-nav"><Link href="/">⌂<span>Home</span></Link><Link href="/#providers">▦<span>Provider</span></Link><Link href="/#popular">⌕<span>Discover</span></Link><Link className="active" href="/audit">✓<span>Audit</span></Link></nav>
  </div></main>
}
