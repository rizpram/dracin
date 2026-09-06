import Link from "next/link";
import { notFound } from "next/navigation";
import HlsPlayer from "@/components/HlsPlayer";
import { getDrama } from "@/lib/dramas";

export default async function WatchPage({ params }: { params: Promise<{ id: string; episode: string }> }) {
  const { id, episode } = await params;
  const drama = await getDrama(id);
  if (!drama) notFound();

  const episodeNumber = Number(episode);
  const current = drama.episodes.find((item) => item.number === episodeNumber);
  if (!current) notFound();

  const prev = drama.episodes.find((item) => item.number === episodeNumber - 1);
  const next = drama.episodes.find((item) => item.number === episodeNumber + 1);

  return (
    <main className="watch-shell">
      <div className="watch-frame">
        <div className="watch-player-stage">
          <HlsPlayer src={current.streamUrl} poster={drama.cover} />
          <Link className="watch-back" href={`/drama/${drama.id}`}>←</Link>
          <div className="watch-top-meta">
            <strong>{drama.title}</strong>
            <span>Episode {current.number} / {drama.episodes.length}</span>
          </div>
        </div>

        <section className="watch-controls">
          <div className="watch-copy">
            <span className="kicker">Episode {current.number}</span>
            <h1>{drama.title}</h1>
          </div>
          <div className="episode-nav-row">
            {prev ? <Link className="episode-nav secondary" href={`/watch/${drama.id}/${prev.number}`}>← EP {prev.number}</Link> : <span />}
            {next ? <Link className="episode-nav primary" href={`/watch/${drama.id}/${next.number}`}>EP {next.number} →</Link> : <Link className="episode-nav primary" href={`/drama/${drama.id}`}>Selesai</Link>}
          </div>
        </section>
      </div>
    </main>
  );
}
