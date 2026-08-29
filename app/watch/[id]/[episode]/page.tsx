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
    <main className="shell">
      <div className="container">
        <Link className="back" href={`/drama/${drama.id}`}>← {drama.title}</Link>
        <div className="player-wrap">
          <div className="player"><HlsPlayer src={current.streamUrl} /></div>
          <div className="section-head"><div><div className="eyebrow">Episode {current.number}</div><h2>{drama.title}</h2></div></div>
          <div className="cta-row">
            {prev ? <Link className="btn secondary" href={`/watch/${drama.id}/${prev.number}`}>← Sebelumnya</Link> : null}
            {next ? <Link className="btn" href={`/watch/${drama.id}/${next.number}`}>Berikutnya →</Link> : <Link className="btn" href={`/drama/${drama.id}`}>Selesai</Link>}
          </div>
        </div>
      </div>
    </main>
  );
}
