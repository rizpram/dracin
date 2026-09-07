import Link from "next/link";
import { AdSlot } from "@/components/Monetization";
import { BottomNav, ProviderBadge } from "@/components/AppChrome";
import { DramaCard, FavoriteButton, ShareButton } from "@/components/DramaUI";
import { getDrama, getDramas, type Drama } from "@/lib/dramas";
import { getProviderCatalog } from "@/lib/captain-multi";
import { getSansekaiCatalog } from "@/lib/sansekai";
import { directoryProvider } from "@/lib/provider-directory";

function providerSlugFromId(id:string){
  const clean=id.startsWith("sansekai:")?id.slice("sansekai:".length):id;
  const i=clean.indexOf("--");
  return i>0?clean.slice(0,i):"";
}

async function recommendations(provider:string,id:string):Promise<Drama[]>{
  let same:Drama[]=[];
  try{
    const entry=directoryProvider(provider);
    if(entry) same=entry.source==="captain"?await getProviderCatalog(provider):await getSansekaiCatalog(provider);
  }catch{}
  const chosen=same.filter(item=>item.id!==id).slice(0,6);
  if(chosen.length>=6)return chosen;
  try{
    const fallback=(await getDramas()).filter(item=>item.id!==id&&!chosen.some(x=>x.id===item.id));
    return [...chosen,...fallback].slice(0,6);
  }catch{return chosen}
}

export default async function DramaDetailPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const drama=await getDrama(id);
  if(!drama){
    const provider=providerSlugFromId(id);
    const suggested=await recommendations(provider,id);
    return <main className="app-shell premium-shell"><div className="mobile-frame premium-frame detail-screen">
      <section className="unavailable-screen"><span className="eyebrow">Konten belum siap</span><b>!</b><h1>Detail drama belum bisa dibuka</h1><p>Judul ini muncul di katalog provider, tapi endpoint detail belum berhasil dinormalisasi. Ini bukan halaman hilang.</p><div className="unavailable-actions"><Link className="primary-action" href={provider?`/provider/${provider}`:"/discover"}>{provider?"Kembali ke provider":"Jelajahi drama"}</Link><Link className="ghost-action" href="/discover">Provider lain</Link></div></section>
      {suggested.length>0&&<section className="detail-section-premium"><div className="section-title-row"><div><span className="eyebrow">Rekomendasi</span><h2>Mungkin Anda suka</h2></div></div><div className="premium-grid">{suggested.map((item,index)=><DramaCard key={item.id} drama={item} index={index}/>)}</div></section>}
      <BottomNav/>
    </div></main>;
  }
  const playable=drama.episodes.length>0;
  return <main className="app-shell premium-shell"><div className="mobile-frame premium-frame detail-screen">
    <section className="premium-detail-hero" style={{backgroundImage:`url(${drama.backdrop||drama.cover})`}}><div className="detail-shade"/><Link className="round-action detail-back" href={`/provider/${drama.provider}`}>←</Link><div className="premium-detail-content"><img src={drama.cover} alt={drama.title}/><div><ProviderBadge name={drama.providerName||drama.provider}/><h1>{drama.title}</h1><div className="detail-meta"><span>★ 4.8</span><span>{drama.episodes.length} Episode</span><span>9:16</span></div><p>{drama.synopsis}</p><div className="hero-actions">{playable?<Link className="primary-action" href={`/watch/${drama.id}/${drama.episodes[0]?.number||1}`}>▶ Tonton Episode 1</Link>:<span className="primary-action disabled-action">Episode belum tersedia</span>}<FavoriteButton drama={drama}/><ShareButton title={drama.title}/></div></div></div></section>
    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_DETAIL_SLOT}/>
    <section className="detail-section-premium"><div className="section-title-row"><div><span className="eyebrow">Episode</span><h2>Daftar Episode</h2></div><span>{drama.episodes.length} total</span></div>{playable?<div className="episode-number-grid-premium">{drama.episodes.map(ep=><Link key={ep.id} href={`/watch/${drama.id}/${ep.number}`}><b>{ep.number}</b><span>Episode {ep.number}</span></Link>)}</div>:<div className="premium-empty compact-empty"><h3>Episode belum berhasil diambil</h3><p>Coba provider lain atau cek lagi setelah adapter provider diperbarui.</p></div>}</section>
    <section className="detail-section-premium"><span className="eyebrow">Tentang</span><h2>Sinopsis</h2><p className="detail-synopsis">{drama.synopsis||"Sinopsis belum tersedia."}</p><div className="detail-tags"><span>{drama.genre||"Drama"}</span><span>{drama.providerName||drama.provider}</span><span>Vertical Short Drama</span></div></section>
    <BottomNav/>
  </div></main>
}
