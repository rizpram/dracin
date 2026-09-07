import Link from "next/link";
import HlsPlayer from "@/components/HlsPlayer";
import { ClientWatchTracker } from "@/components/DramaUI";
import { getDrama, getEpisodeStream } from "@/lib/dramas";

function providerSlugFromId(id:string){const clean=id.startsWith("sansekai:")?id.slice("sansekai:".length):id;const i=clean.indexOf("--");return i>0?clean.slice(0,i):""}

export default async function WatchPage({params}:{params:Promise<{id:string;episode:string}>}){
  const {id,episode}=await params;
  const drama=await getDrama(id);
  const episodeNumber=Number(episode);

  if(!drama){const provider=providerSlugFromId(id);return <main className="watch-shell premium-watch"><div className="watch-frame premium-watch-frame"><section className="unavailable-screen watch-unavailable"><span className="eyebrow">Playback belum siap</span><b>!</b><h1>Drama belum bisa dimuat</h1><p>Adapter detail provider ini belum berhasil membaca kontennya. Tidak diarahkan ke halaman 404 lagi.</p><div className="unavailable-actions"><Link className="primary-action" href={provider?`/provider/${provider}`:"/discover"}>Kembali</Link><Link className="ghost-action" href="/discover">Provider lain</Link></div></section></div></main>}

  const current=drama.episodes.find(x=>x.number===episodeNumber);
  if(!current){return <main className="watch-shell premium-watch"><div className="watch-frame premium-watch-frame"><section className="unavailable-screen watch-unavailable"><span className="eyebrow">Episode tidak tersedia</span><b>!</b><h1>{drama.title}</h1><p>Episode {Number.isFinite(episodeNumber)?episodeNumber:episode} tidak ditemukan pada daftar episode provider.</p><div className="unavailable-actions"><Link className="primary-action" href={`/drama/${drama.id}`}>Daftar Episode</Link><Link className="ghost-action" href={`/provider/${drama.provider}`}>Provider</Link></div></section></div></main>}

  const streamUrl=await getEpisodeStream(drama,episodeNumber);
  const prev=drama.episodes.find(x=>x.number===episodeNumber-1);
  const next=drama.episodes.find(x=>x.number===episodeNumber+1);
  const nextHref=next?`/watch/${drama.id}/${next.number}`:undefined;

  if(!streamUrl){return <main className="watch-shell premium-watch"><div className="watch-frame premium-watch-frame"><section className="unavailable-screen watch-unavailable"><span className="eyebrow">Safe Play unavailable</span><b>▶</b><h1>{drama.title}</h1><p>Episode {current.number} ada, tetapi provider belum mengembalikan URL HLS/MP4 yang aman untuk diputar. DRACIN tidak menjalankan unlock/decrypt route.</p><div className="unavailable-actions">{next?<Link className="primary-action" href={nextHref!}>Coba EP {next.number}</Link>:<Link className="primary-action" href={`/drama/${drama.id}`}>Daftar Episode</Link>}<Link className="ghost-action" href={`/provider/${drama.provider}`}>Provider lain</Link></div></section></div></main>}

  return <main className="watch-shell premium-watch"><div className="watch-frame premium-watch-frame"><ClientWatchTracker drama={drama} episode={episodeNumber}/><div className="watch-player-stage"><HlsPlayer src={streamUrl} poster={drama.cover} nextHref={nextHref}/><Link className="watch-back" href={`/drama/${drama.id}`}>←</Link><div className="watch-top-meta"><strong>{drama.title}</strong><span>Episode {current.number} / {drama.episodes.length}</span></div></div>
    <section className="watch-controls premium-watch-controls"><div className="watch-copy"><span className="eyebrow">Episode {current.number}</span><h1>{drama.title}</h1><p>{current.title}</p></div><div className="episode-nav-row">{prev?<Link className="episode-nav secondary" href={`/watch/${drama.id}/${prev.number}`}>← EP {prev.number}</Link>:<span/>}{next?<Link className="episode-nav primary" href={nextHref!}>EP {next.number} →</Link>:<Link className="episode-nav primary" href={`/drama/${drama.id}`}>Selesai</Link>}</div><div className="watch-episode-strip">{drama.episodes.slice(Math.max(0,episodeNumber-4),Math.min(drama.episodes.length,episodeNumber+5)).map(ep=><Link key={ep.id} className={ep.number===episodeNumber?"active":""} href={`/watch/${drama.id}/${ep.number}`}>{ep.number}</Link>)}</div></section>
  </div></main>
}
