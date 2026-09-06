import Link from "next/link";
import { notFound } from "next/navigation";
import { getProviderCatalog } from "@/lib/captain-multi";
import { directoryProvider } from "@/lib/provider-directory";
import { getSansekaiCatalog, SANSEKAI_ROUTE_SUMMARY } from "@/lib/sansekai";
import { PROVIDER_ROUTES } from "@/lib/provider-routes";

export const dynamic = "force-dynamic";

export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const provider = directoryProvider(slug);
  if (!provider) notFound();
  const dramas = provider.source === "captain" ? await getProviderCatalog(slug) : await getSansekaiCatalog(slug);
  const caps = provider.source === "captain" ? PROVIDER_ROUTES[slug] : SANSEKAI_ROUTE_SUMMARY[slug];
  const capabilityLabels = [
    caps?.catalog?.length ? "Katalog" : null,
    "detail" in (caps || {}) && caps?.detail ? "Detail" : null,
    "episodes" in (caps || {}) && caps?.episodes ? "Episode" : null,
    "play" in (caps || {}) && caps?.play ? "Play" : null,
  ].filter(Boolean);

  return (
    <main className="app-shell">
      <div className="mobile-frame">
        <header className="mobile-topbar">
          <Link href="/" className="back-link">‹</Link>
          <div className="brand">{provider.name}</div>
          <span className={`status-pill ${provider.source === "sansekai" ? "status-alt" : ""}`}>{provider.source.toUpperCase()}</span>
        </header>
        <section className="home-section provider-page">
          <div className="provider-heading">
            <span className="kicker">{provider.source === "captain" ? "Primary source" : "Fallback source"}</span>
            <h1>{provider.name}</h1>
            <p>{provider.source === "captain" ? "Data utama dari Captain API." : "Dipakai karena provider ini tidak tersedia di Captain. Sansekai dibatasi 10 request/menit."}</p>
            <div className="capability-row">{capabilityLabels.map((x)=><span key={String(x)}>{x}</span>)}</div>
          </div>

          <div className="section-title-row"><h2>Daftar Konten</h2><span>{dramas.length} judul</span></div>
          {dramas.length ? (
            <div className="portrait-grid">
              {dramas.map((drama) => (
                <Link href={`/drama/${encodeURIComponent(drama.id)}`} className="portrait-card" key={drama.id}>
                  <div className="portrait-poster" style={{ backgroundImage: `url(${drama.cover})` }}>
                    <span className="episode-badge">{drama.episodes.length ? `${drama.episodes.length} EP` : provider.name}</span>
                  </div>
                  <h3>{drama.title}</h3>
                  <p>{drama.genre}</p>
                </Link>
              ))}
            </div>
          ) : <div className="provider-empty"><h3>Katalog belum lolos audit</h3><p>Source tetap terdaftar. Cek halaman Audit untuk status live dan endpoint yang sedang gagal.</p><Link className="ghost-action audit-link" href={`/api/audit/provider?slug=${slug}`}>Lihat audit JSON</Link></div>}
        </section>
        <nav className="mobile-nav">
          <Link href="/">⌂<span>Home</span></Link>
          <Link className="active" href="/#providers">▦<span>Provider</span></Link>
          <Link href="/#popular">⌕<span>Discover</span></Link>
          <Link href="/audit">✓<span>Audit</span></Link>
        </nav>
      </div>
    </main>
  );
}
