import Link from "next/link";
import { BottomNav, TopBar } from "@/components/AppChrome";
import { DramaCard } from "@/components/DramaUI";
import { getDramas } from "@/lib/dramas";
import { PROVIDER_DIRECTORY } from "@/lib/provider-directory";

export const dynamic="force-dynamic";

export default async function DiscoverPage({searchParams}:{searchParams:Promise<{genre?:string}>}){
 const {genre="Semua"}=await searchParams;const dramas=await getDramas();const filtered=genre==="Semua"?dramas:dramas.filter(d=>d.genre.toLowerCase().includes(genre.toLowerCase()));
 return <main className="app-shell premium-shell"><div className="mobile-frame premium-frame"><TopBar title="Explore"/><section className="search-hero"><span className="eyebrow">Jelajahi</span><h1>Temukan drama baru</h1><div className="provider-filter-scroll"><Link className={genre==="Semua"?"active":""} href="/discover">Semua</Link>{["Romansa","Action","Komedi","Fantasi","Thriller","Drama","Misteri"].map(g=><Link className={genre===g?"active":""} href={`/discover?genre=${encodeURIComponent(g)}`} key={g}>{g}</Link>)}</div></section><section className="home-section premium-section"><div className="premium-grid">{filtered.map((d,i)=><DramaCard key={d.id} drama={d} index={i}/>)}</div></section><section className="home-section premium-section"><div className="section-title-row"><h2>Semua Provider</h2><span>{PROVIDER_DIRECTORY.length}</span></div><div className="provider-chip-grid">{PROVIDER_DIRECTORY.map(p=><Link key={p.slug} href={`/provider/${p.slug}`}><span className={`source-dot ${p.source}`}/><strong>{p.name}</strong></Link>)}</div></section><BottomNav/></div></main>
}
