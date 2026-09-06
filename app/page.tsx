import Link from "next/link";
import { AdSlot, SupportButton } from "@/components/Monetization";
import { getDramas } from "@/lib/dramas";
import { CAPTAIN_PROVIDERS, providerSlug } from "@/lib/captain-multi";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dramas = await getDramas();
  const featured = dramas[0];

  return (
    <main className="app-shell">
      <div className="mobile-frame">
        <header className="mobile-topbar">
          <div className="brand">DRA<span>CIN</span></div>
          <Link href="/api/health" className="status-pill">LIVE</Link>
        </header>

        {featured ? (
          <section className="mobile-hero" style={{ backgroundImage: `url(${featured.cover})` }}>
            <div className="mobile-hero-overlay" />
            <div className="mobile-hero-content">
              <span className="kicker">Pilihan Hari Ini · {featured.providerName || "FreeReels"}</span>
              <h1>{featured.title}</h1>
              <p>{featured.synopsis}</p>
              <div className="hero-actions">
                <Link className="primary-action" href={`/watch/${featured.id}/1`}>▶ Tonton Sekarang</Link>
                <Link className="ghost-action" href={`/drama/${featured.id}`}>Detail</Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="mobile-hero">
            <div className="mobile-hero-overlay" />
            <div className="mobile-hero-content">
              <span className="kicker">DRACIN LIVE</span>
              <h1>Katalog sedang dimuat</h1>
              <p>Belum ada data dari provider. Cek status API atau konfigurasi Captain.</p>
              <div className="hero-actions"><Link className="ghost-action" href="/api/health">Cek API</Link></div>
            </div>
          </section>
        )}

        <section className="home-section" id="providers">
          <div className="section-title-row">
            <div><span className="kicker">Captain API</span><h2>Semua Provider</h2></div>
            <span>{CAPTAIN_PROVIDERS.length} aktif</span>
          </div>
          <div className="provider-scroll">
            {CAPTAIN_PROVIDERS.map((provider) => (
              <Link className="provider-chip" href={`/provider/${providerSlug(provider)}`} key={provider}>
                <span className="provider-dot" />{provider}
              </Link>
            ))}
          </div>
        </section>

        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT} />

        <section className="home-section" id="popular">
          <div className="section-title-row"><h2>Drama Populer</h2><span>{dramas.length} judul</span></div>
          {dramas.length ? (
            <div className="portrait-grid">
              {dramas.map((drama) => (
                <Link href={`/drama/${drama.id}`} className="portrait-card" key={drama.id}>
                  <div className="portrait-poster" style={{ backgroundImage: `url(${drama.cover})` }}>
                    <span className="episode-badge">{drama.episodes.length ? `${drama.episodes.length} EP` : (drama.providerName || "DRAMA")}</span>
                  </div>
                  <h3>{drama.title}</h3><p>{drama.genre}</p>
                </Link>
              ))}
            </div>
          ) : <p>Belum ada katalog dari provider.</p>}
        </section>

        <SupportButton />
        <nav className="mobile-nav">
          <Link className="active" href="/">⌂<span>Home</span></Link>
          <Link href="/#providers">▦<span>Provider</span></Link>
          <Link href="/#popular">⌕<span>Discover</span></Link>
          <Link href="/">◉<span>Profile</span></Link>
        </nav>
      </div>
    </main>
  );
}
