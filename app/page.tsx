import Link from "next/link";
import { getDramas } from "@/lib/dramas";

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

        <section className="mobile-hero" style={{ backgroundImage: `url(${featured.cover})` }}>
          <div className="mobile-hero-overlay" />
          <div className="mobile-hero-content">
            <span className="kicker">Pilihan Hari Ini</span>
            <h1>{featured.title}</h1>
            <p>{featured.synopsis}</p>
            <div className="hero-actions">
              <Link className="primary-action" href={`/watch/${featured.id}/1`}>▶ Tonton Sekarang</Link>
              <Link className="ghost-action" href={`/drama/${featured.id}`}>Detail</Link>
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="section-title-row">
            <h2>Drama Populer</h2>
            <span>{dramas.length} judul</span>
          </div>
          <div className="portrait-grid">
            {dramas.map((drama) => (
              <Link href={`/drama/${drama.id}`} className="portrait-card" key={drama.id}>
                <div className="portrait-poster" style={{ backgroundImage: `url(${drama.cover})` }}>
                  <span className="episode-badge">{drama.episodes.length} EP</span>
                </div>
                <h3>{drama.title}</h3>
                <p>{drama.genre}</p>
              </Link>
            ))}
          </div>
        </section>

        <nav className="mobile-nav">
          <Link className="active" href="/">⌂<span>Home</span></Link>
          <Link href="/#popular">⌕<span>Discover</span></Link>
          <Link href="/">♡<span>Watchlist</span></Link>
          <Link href="/">◉<span>Profile</span></Link>
        </nav>
      </div>
    </main>
  );
}
