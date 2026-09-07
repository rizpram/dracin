import Link from "next/link";
import { PROVIDER_DIRECTORY } from "@/lib/provider-directory";
import { AuditCheck } from "@/components/AuditCheck";
import { TopBar } from "@/components/AppChrome";

export default function AuditPage(){
  return <main className="app-shell premium-shell"><div className="mobile-frame premium-frame audit-page">
    <TopBar title="Provider Audit" />
    <section className="search-hero">
      <span className="eyebrow">Developer Tools</span>
      <h1>Audit provider</h1>
      <p>Provider page dicek terpisah dari capability API. Tombol Cek live menampilkan Katalog, Detail, Episode, dan Safe Play tanpa membuka JSON mentah.</p>
    </section>
    <section className="home-section premium-section">
      <div className="audit-legend"><span>K = Katalog</span><span>D = Detail</span><span>E = Episode</span><span>P = Play aman</span></div>
      <div className="audit-list">
        {PROVIDER_DIRECTORY.map((p)=><article className="audit-row audit-row-v2" key={p.slug}>
          <div className="audit-provider-copy"><span className={`source-dot ${p.source}`} /><strong>{p.name}</strong><small>{p.source === "captain" ? "Captain primary" : "Sansekai fallback"}</small></div>
          <div className="audit-actions-v2">
            <Link href={`/provider/${p.slug}`}>Buka provider</Link>
            <AuditCheck slug={p.slug}/>
          </div>
        </article>)}
      </div>
    </section>
    <div className="admin-return"><Link href="/admin">← Kembali ke Admin</Link></div>
  </div></main>
}
