import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/Monetization";
import { getDrama } from "@/lib/dramas";

export default async function DramaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const drama = await getDrama(id);
  if (!drama) notFound();

  return (
    <main className="app-shell">
      <div className="mobile-frame detail-screen">
        <section className="detail-cover-mobile" style={{ backgroundImage: `url(${drama.cover})` }}>
          <div className="detail-shade" />
          <Link className="floating-back" href="/">←</Link>
          <div className="detail-mobile-copy">
            <span className="kicker">{drama.genre}</span>
            <h1>{drama.title}</h1>
            <p>{drama.synopsis}</p>
            <div className="detail-meta">
              <span>{drama.episodes.length} Episode</span>
              <span>9:16 Vertical</span>
            </div>
            <Link className="primary-action wide" href={`/watch/${drama.id}/1`}>▶ Mulai Episode 1</Link>
          </div>
        </section>

        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_DETAIL_SLOT} />

        <section className="episode-sheet">
          <div className="section-title-row">
            <h2>Daftar Episode</h2>
            <span>Tap untuk nonton</span>
          </div>
          <div className="episode-grid-mobile">
            {drama.episodes.map((episode) => (
              <Link className="episode-tile" key={episode.id} href={`/watch/${drama.id}/${episode.number}`}>
                <strong>{episode.number}</strong>
                <span>Episode {episode.number}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
