import Link from "next/link";
import { notFound } from "next/navigation";
import HlsPlayer from "@/components/HlsPlayer";
import { ClientWatchTracker } from "@/components/DramaUI";
import { getDrama, getEpisodeStream } from "@/lib/dramas";

export default async function WatchPage({params}:{params:Promise<{id:string;episode:string}>}){
  const {id,episode}=await params;const drama=await getDrama(id);if(!drama)notFound();const episodeNumber=Number(episode);const current=drama.episodes.find(x=>x.number===episodeNumber);if(!current)notFound();const streamUrl=await getEpisodeStream(drama,episodeNumber);if(!streamUrl)notFound();const prev=drama.episodes.find(x=>x.number===episodeNumber-1);const next=drama.episodes.find(x=>x.number===episodeNumber+1);const nextHref=next?`/watch/${drama.id}/${next.number}`:undefined;
  return <main className="watch-shell premium-watch"><div className="watch-frame premium-watch-frame"><ClientWatchTracker drama={drama} episode={episodeNumber}/><div className="watch-player-stage"><HlsPlayer src={streamUrl} poster={drama.cover} nextHref={nextHref}/><Link className="watch-back" href={`/drama/${drama.id}`}>←</Link><div className="watch-top-meta"><strong>{drama.title}</strong><span>Episode {current.number} / {drama.episodes.length}</span></div></div>
    <section className="watch-controls premium-watch-controls"><div className="watch-copy"><span className="eyebrow">Episode {current.number}</span><h1>{drama.title}</h1><p>{current.title}</p></div><div className="episode-nav-row">{prev?<Link className="episode-nav secondary" href={`/watch/${drama.id}/${prev.number}`}>← EP {prev.number}</Link>:<span/>}{next?<Link className="episode-nav primary" href={nextHref!}>EP {next.number} →</Link>:<Link className="episode-nav primary" href={`/drama/${drama.id}`}>Selesai</Link>}</div><div className="watch-episode-strip">{drama.episodes.slice(Math.max(0,episodeNumber-4),Math.min(drama.episodes.length,episodeNumber+5)).map(ep=><Link key={ep.id} className={ep.number===episodeNumber?"active":""} href={`/watch/${drama.id}/${ep.number}`}>{ep.number}</Link>)}</div></section>
  </div></main>
}
