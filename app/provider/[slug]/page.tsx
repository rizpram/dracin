import Link from "next/link";
import { notFound } from "next/navigation";
import { getProviderCatalog, providerName } from "@/lib/captain-multi";

export const dynamic = "force-dynamic";

export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = providerName(slug);
  if (!name) notFound();
  const dramas = await getProviderCatalog(slug);

  return (
    <main className="app-shell">
      <div className="mobile-frame">
        <header className="mobile-topbar">
          <Link href="/" className="back-link">‹</Link>
          <div className="brand">{name}</div>
          <span className="status-pill">CAPTAIN</span>
        </header>
        <section className="home-section provider-page">
          <div className="section-title-row">
            <div><span className="kicker">Provider</span><h2>{name}</h2></div>
            <span>{dramas.length} judul</span>
          </div>
          {dramas.length ? (
            <div className="portrait-grid">
              {dramas.map((drama) => (
                <Link href={`/drama/${encodeURIComponent(drama.id)}`} className="portrait-card" key={drama.id}>
                  <div className="portrait-poster" style={{ backgroundImage: `url(${drama.cover})` }}>
                    <span className="episode-badge">{name}</span>
                  </div>
                  <h3>{drama.title}</h3>
                  <p>{drama.genre}</p>
                </Link>
              ))}
            </div>
          ) : <div className="provider-empty"><h3>Belum ada katalog yang bisa dinormalisasi</h3><p>Provider tetap terdaftar di DRACIN dan akan otomatis ikut saat endpoint/feed Captain kompatibel.</p></div>}
        </section>
        <nav className="mobile-nav">
          <Link href="/">⌂<span>Home</span></Link>
          <Link className="active" href="/#providers">▦<span>Provider</span></Link>
          <Link href="/#popular">⌕<span>Discover</span></Link>
          <Link href="/">◉<span>Profile</span></Link>
        </nav>
      </div>
    </main>
  );
}
