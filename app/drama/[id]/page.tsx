import Link from "next/link";
import { notFound } from "next/navigation";
import { getDrama } from "@/lib/dramas";

export default async function DramaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const drama = await getDrama(id);
  if (!drama) notFound();

  return (
    <main className="shell">
      <div className="container">
        <Link className="back" href="/">← Kembali</Link>
        <section className="detail-hero">
          <div className="detail-cover" style={{ backgroundImage: `url(${drama.cover})` }} />
          <div className="detail-copy">
            <span className="tag">{drama.genre}</span>
            <h1>{drama.title}</h1>
            <p className="muted">{drama.synopsis}</p>
            <div className="cta-row">
              <Link className="btn" href={`/watch/${drama.id}/1`}>▶ Episode 1</Link>
              <span className="btn secondary">{drama.episodes.length} Episode</span>
            </div>
          </div>
        </section>

        <div className="section-head"><h2>Episode</h2><span className="muted">Tonton berurutan</span></div>
        <div className="episode-list">
          {drama.episodes.map((episode) => (
            <Link className="episode" key={episode.id} href={`/watch/${drama.id}/${episode.number}`}>
              <div><strong>{episode.title}</strong><small>{drama.title}</small></div>
              <span>▶</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
