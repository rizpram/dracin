"use client";

import Link from "next/link";
import { useEffect,useState } from "react";
import type { Drama } from "@/lib/dramas";

const FAV_KEY="dracin_favorites";
const HIST_KEY="dracin_history";
function read<T>(key:string,fallback:T):T{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}}
export type LocalHistory={id:string;title:string;cover:string;episode:number;provider?:string;at:number};
export function addHistory(drama:Drama,episode:number){const current=read<LocalHistory[]>(HIST_KEY,[]);const next=[{id:drama.id,title:drama.title,cover:drama.cover,episode,provider:drama.provider,at:Date.now()},...current.filter(x=>x.id!==drama.id)].slice(0,50);localStorage.setItem(HIST_KEY,JSON.stringify(next));window.dispatchEvent(new Event("dracin-history"))}

export function FavoriteButton({drama}:{drama:Drama}){const [fav,setFav]=useState(false);useEffect(()=>{setFav(read<string[]>(FAV_KEY,[]).includes(drama.id))},[drama.id]);function toggle(){const current=read<string[]>(FAV_KEY,[]);const next=current.includes(drama.id)?current.filter(x=>x!==drama.id):[drama.id,...current];localStorage.setItem(FAV_KEY,JSON.stringify(next));setFav(next.includes(drama.id));window.dispatchEvent(new Event("dracin-favorites"))}return <button className={`favorite-action ${fav?"active":""}`} onClick={toggle} aria-label={fav?"Hapus favorit":"Tambah favorit"}>{fav?"♥":"♡"}</button>}

export function ShareButton({title}:{title:string}){async function share(){try{if(navigator.share)await navigator.share({title,url:location.href});else await navigator.clipboard.writeText(location.href)}catch{}}return <button className="round-action" onClick={share} aria-label="Bagikan">↗</button>}

export function DramaCard({drama,index=0}:{drama:Drama;index?:number}){return <article className="premium-drama-card" style={{animationDelay:`${Math.min(index*40,400)}ms`}}>
  <Link href={`/drama/${encodeURIComponent(drama.id)}`} className="poster-link">
    <div className="premium-poster" style={{backgroundImage:`url(${drama.cover})`}}>
      <span className="card-provider">{drama.providerName||drama.provider}</span>
      <span className="episode-badge">{drama.episodes.length?`${drama.episodes.length} EP`:"DRAMA"}</span>
      <span className="poster-play">▶</span>
    </div>
  </Link>
  <div className="card-copy"><Link href={`/drama/${encodeURIComponent(drama.id)}`}><h3>{drama.title}</h3></Link><p>{drama.genre||"Drama"}</p></div>
</article>}

export function ClientWatchTracker({drama,episode}:{drama:Drama;episode:number}){useEffect(()=>{addHistory(drama,episode)},[drama,episode]);return null}

export function FavoritesClient(){const [ids,setIds]=useState<string[]>([]);useEffect(()=>{const load=()=>setIds(read<string[]>(FAV_KEY,[]));load();window.addEventListener("dracin-favorites",load);return()=>window.removeEventListener("dracin-favorites",load)},[]);if(!ids.length)return <div className="empty-state premium-empty"><b>♡</b><h2>Belum ada favorit</h2><p>Tap ikon hati di halaman detail untuk menyimpan drama.</p></div>;return <div className="saved-list">{ids.map(id=><Link key={id} href={`/drama/${encodeURIComponent(id)}`}><span>♥</span><strong>{id.replace(/^.*--/,"")}</strong><small>Buka drama</small></Link>)}</div>}

export function HistoryClient(){const [items,setItems]=useState<LocalHistory[]>([]);useEffect(()=>{const load=()=>setItems(read<LocalHistory[]>(HIST_KEY,[]));load();window.addEventListener("dracin-history",load);return()=>window.removeEventListener("dracin-history",load)},[]);if(!items.length)return <div className="empty-state premium-empty"><b>◷</b><h2>Belum ada riwayat</h2><p>Drama yang ditonton akan muncul di sini.</p></div>;return <div className="history-list">{items.map(item=><Link key={`${item.id}-${item.at}`} href={`/watch/${encodeURIComponent(item.id)}/${item.episode}`}><div className="history-thumb" style={{backgroundImage:`url(${item.cover})`}}/><div><strong>{item.title}</strong><span>Lanjut Episode {item.episode}</span></div><b>›</b></Link>)}</div>}
