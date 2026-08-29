import Link from "next/link";
import { getDramas } from "@/lib/dramas";

export default async function HomePage() {
  const dramas = await getDramas();
  const featured = dramas[0];

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">DRA<span>CIN</span></div>
        <Link href="/api/health" className="tag">LIVE</Link>
      </header>

      <section className="hero" style={{ backgroundImage: `url(${featured.backdrop})` }}>
        <div className="hero-content">
          <div className="eyebrow">Pilihan utama hari ini</div>
          <h1>{featured.title}</h1>
          <p className="muted">{featured.synopsis}</p>
          <div className="cta-row">
            <Link className="btn" href={`/watch/${featured.id}/1`}>▶ Mulai Nonton</Link>
            <Link className="btn secondary" href={`/drama/${featured.id}`}>Detail</Link>
          </div>
        </div>
      </section>

      <div className="container">
        <input className="search" placeholder="Cari drama, genre, atau judul..." aria-label="Cari drama" />
        <div className="section-head"><h2>Sedang Populer</h2><span className="muted">Short drama pilihan</span></div>
        <div className="grid">
          {dramas.map((drama) => (
            <Link href={`/drama/${drama.id}`} className="card" key={drama.id}>
              <div className="poster" style={{ backgroundImage: `url(${drama.cover})` }} />
              <div className="card-copy"><h3>{drama.title}</h3><span className="tag">{drama.genre}</span></div>
            </Link>
          ))}
        </div>
      </div>

      <nav className="bottom-nav"><Link href="/">Home</Link><Link href="/#popular">Popular</Link><Link href="/">Watchlist</Link></nav>
    </main>
  );
}
