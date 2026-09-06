import Link from "next/link";
import { BottomNav, TopBar } from "@/components/AppChrome";
import { DramaCard } from "@/components/DramaUI";
import { PROVIDER_DIRECTORY } from "@/lib/provider-directory";
import { searchCatalogs } from "@/lib/catalog-search";

export const dynamic="force-dynamic";

export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string;provider?:string}>}){
  const {q="",provider="all"}=await searchParams;const results=q?await searchCatalogs(q,provider):[];
  return <main className="app-shell premium-shell"><div className="mobile-frame premium-frame"><TopBar title="Cari"/>
    <section className="search-hero"><span className="eyebrow">Pencarian Global</span><h1>{q?`“${q}”`:"Cari drama"}</h1><p>{q?`${results.length} hasil ditemukan dari katalog yang diaudit.`:"Gunakan kolom pencarian untuk mencari lintas provider."}</p><div className="provider-filter-scroll"><Link className={provider==="all"?"active":""} href={`/search?q=${encodeURIComponent(q)}&provider=all`}>Semua</Link>{PROVIDER_DIRECTORY.slice(0,18).map(p=><Link className={provider===p.slug?"active":""} key={p.slug} href={`/search?q=${encodeURIComponent(q)}&provider=${p.slug}`}>{p.name}</Link>)}</div></section>
    <section className="home-section premium-section">{results.length?<div className="premium-grid">{results.map((d,i)=><DramaCard key={d.id} drama={d} index={i}/>)}</div>:<div className="premium-empty"><b>⌕</b><h2>{q?"Tidak ditemukan":"Mulai cari drama"}</h2><p>{q?"Coba kata kunci lain atau pilih provider berbeda.":"Cari berdasarkan judul, genre, atau nama provider."}</p></div>}</section><BottomNav/></div></main>
}
