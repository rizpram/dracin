import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/Monetization";
import { BottomNav, ProviderBadge } from "@/components/AppChrome";
import { FavoriteButton, ShareButton } from "@/components/DramaUI";
import { getDrama } from "@/lib/dramas";

export default async function DramaDetailPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;const drama=await getDrama(id);if(!drama)notFound();
  return <main className="app-shell premium-shell"><div className="mobile-frame premium-frame detail-screen">
    <section className="premium-detail-hero" style={{backgroundImage:`url(${drama.backdrop||drama.cover})`}}><div className="detail-shade"/><Link className="round-action detail-back" href="/">←</Link><div className="premium-detail-content"><img src={drama.cover} alt={drama.title}/><div><ProviderBadge name={drama.providerName||drama.provider}/><h1>{drama.title}</h1><div className="detail-meta"><span>★ 4.8</span><span>{drama.episodes.length} Episode</span><span>9:16</span></div><p>{drama.synopsis}</p><div className="hero-actions"><Link className="primary-action" href={`/watch/${drama.id}/1`}>▶ Tonton Episode 1</Link><FavoriteButton drama={drama}/><ShareButton title={drama.title}/></div></div></div></section>
    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_DETAIL_SLOT}/>
    <section className="detail-section-premium"><div className="section-title-row"><div><span className="eyebrow">Episode</span><h2>Daftar Episode</h2></div><span>{drama.episodes.length} total</span></div><div className="episode-number-grid-premium">{drama.episodes.map(ep=><Link key={ep.id} href={`/watch/${drama.id}/${ep.number}`}><b>{ep.number}</b><span>Episode {ep.number}</span></Link>)}</div></section>
    <section className="detail-section-premium"><span className="eyebrow">Tentang</span><h2>Sinopsis</h2><p className="detail-synopsis">{drama.synopsis||"Sinopsis belum tersedia."}</p><div className="detail-tags"><span>{drama.genre||"Drama"}</span><span>{drama.providerName||drama.provider}</span><span>Vertical Short Drama</span></div></section>
    <BottomNav/>
  </div></main>
}
