import { providerFetch } from "@/lib/providers";
import type { Drama, Episode } from "@/lib/dramas";

type Rec = Record<string, any>;

type SafeProvider = {
  name: string;
  catalog: string[];
  detail?: string;
  episodes?: string;
  play?: string;
};

const ROUTES: Record<string, SafeProvider> = {
  pinedrama: { name: "PineDrama", catalog: ["/pinedrama/foryou", "/pinedrama/trending"], detail: "/pinedrama/detail", play: "/pinedrama/episode" },
  dramabox: { name: "DramaBox", catalog: ["/dramabox/foryou", "/dramabox/latest", "/dramabox/trending", "/dramabox/dubindo"], detail: "/dramabox/detail", episodes: "/dramabox/allepisode" },
  goodshort: { name: "GoodShort", catalog: ["/goodshort/foryou", "/goodshort/latest", "/goodshort/trending", "/goodshort/anime"], detail: "/goodshort/detail", episodes: "/goodshort/allepisode" },
  mydrama: { name: "My Drama", catalog: ["/mydrama/populer", "/mydrama/latest", "/mydrama/eksklusif", "/mydrama/rank"], detail: "/mydrama/detail", episodes: "/mydrama/episode" },
  "anime-sansekai": { name: "Anime", catalog: ["/anime/latest", "/anime/recommended", "/anime/movie"], detail: "/anime/detail", play: "/anime/getvideo" },
  komik: { name: "Komik", catalog: ["/komik/recommended", "/komik/latest", "/komik/popular"], detail: "/komik/detail", episodes: "/komik/chapterlist" },
};

function rec(v: unknown): v is Rec { return !!v && typeof v === "object" && !Array.isArray(v); }
function text(r: Rec, keys: string[]) { for (const k of keys) { const v=r[k]; if (typeof v === "string" && v.trim()) return v.trim(); if (typeof v === "number") return String(v); } return ""; }
function numberValue(r: Rec, keys: string[]) { for (const k of keys) { const n=Number(r[k]); if (Number.isFinite(n) && n>0) return n; } return 0; }
function rawId(r: Rec) { return text(r,["id","collection_id","collectionId","bookId","book_id","dramaId","drama_id","seriesId","series_id","videoId","video_id","contentId","content_id","slug","code","key"]); }
function title(r: Rec) { return text(r,["title","name","bookName","book_name","dramaName","drama_name","seriesName","series_name","videoName","video_name"]); }
function cover(r: Rec, depth=0): string { if(depth>4)return""; const v=text(r,["cover","coverUrl","cover_url","cover_urls","poster","posterUrl","poster_url","image","imageUrl","image_url","thumbnail","thumb"]); if(/^https?:\/\//i.test(v))return v; const covers=r.cover_urls;if(Array.isArray(covers)){const first=covers.find((x)=>typeof x==="string"&&/^https?:\/\//i.test(x));if(first)return first;} for(const x of Object.values(r)){if(rec(x)){const c=cover(x,depth+1);if(c)return c}} return ""; }
function records(v: unknown, depth=0): Rec[] { if(depth>7)return[]; if(Array.isArray(v)){const direct=v.filter(rec).filter(x=>rawId(x)&&title(x)); if(direct.length)return direct; return v.flatMap(x=>records(x,depth+1));} if(rec(v)){for(const k of["data","collections","collection","list","items","results","books","dramas","series","videos","content"]){if(k in v){const f=records(v[k],depth+1);if(f.length)return f}} return Object.values(v).flatMap(x=>records(x,depth+1));} return[]; }
function episodeRecords(v: unknown, depth=0): Rec[] { if(depth>7)return[]; if(Array.isArray(v)){const rs=v.filter(rec); const eps=rs.filter(r=>numberValue(r,["episode","episodeNumber","episode_no","episodeNo","ep","chapter","chapterNumber","chapterNo","chapter_no","index"])||text(r,["episodeid","episodeId","episode_id","chapterid","chapterId","chapter_id","id"])); if(eps.length)return eps; return v.flatMap(x=>episodeRecords(x,depth+1));} if(rec(v)){for(const k of["episodes","chapters","episodeList","episode_list","chapterList","chapter_list","list","items","data"]){if(k in v){const f=episodeRecords(v[k],depth+1);if(f.length)return f}} return Object.values(v).flatMap(x=>episodeRecords(x,depth+1));} return[]; }
function stream(v: unknown, depth=0): string { if(depth>8)return""; if(typeof v==="string"&&/^https?:\/\//i.test(v)&&/(\.m3u8|\.mp4|stream|video)/i.test(v))return v; if(Array.isArray(v)){for(const x of v){const s=stream(x,depth+1);if(s)return s}} else if(rec(v)){for(const k of["hls_url","hlsUrl","m3u8","m3u8_url","videoUrl","video_url","streamUrl","stream_url","playUrl","play_url","url"]){const s=stream(v[k],depth+1);if(s)return s}for(const x of Object.values(v)){const s=stream(x,depth+1);if(s)return s}} return""; }

async function get(path:string){const r=await providerFetch("sansekai",path);if(!r.ok)throw new Error(`Sansekai ${r.status}`);return r.json();}
function query(path:string,id:string,episode?:Episode){const qs=new URLSearchParams(); qs.set("id",id); qs.set("collection_id",id); qs.set("collectionId",id); qs.set("bookId",id); qs.set("dramaId",id); qs.set("seriesId",id); if(episode){const number=String(episode.number);const sourceId=episode.sourceId||number;qs.set("episode",number);qs.set("episodeNumber",number);qs.set("episode_no",number);qs.set("ep",number);qs.set("episodeId",sourceId);qs.set("chapterId",sourceId);} return `${path}?${qs}`;}
function normalizeEpisode(r:Rec,i:number):Episode{const n=numberValue(r,["episode","episodeNumber","episode_no","episodeNo","ep","chapter","chapterNumber","chapterNo","chapter_no","index"])||i+1;const sid=text(r,["episodeid","episodeId","episode_id","chapterid","chapterId","chapter_id","id"])||String(n);return{id:sid,sourceId:sid,number:n,title:text(r,["title","name","episodeTitle","episode_title","chapterTitle","chapter_title"])||`Episode ${n}`,streamUrl:stream(r)||undefined};}
function normalizeDrama(r:Rec,slug:string,name:string,episodes:Episode[]=[]):Drama|null{const id=rawId(r),t=title(r);if(!id||!t)return null;const c=cover(r)||"https://placehold.co/720x1280/111111/eeeeee?text=DRACIN";let eps=episodes;if(!eps.length){const total=numberValue(r,["total_episodes","totalEpisodes","episode_count","episodeCount","chapter_count","chapterCount"]);if(total>0&&total<=500)eps=Array.from({length:total},(_,i)=>({id:`ep-${i+1}`,sourceId:String(i+1),number:i+1,title:`Episode ${i+1}`}));}const rawGenre=r.tags||r.categories||r.genre||r.category;const genre=Array.isArray(rawGenre)?rawGenre.map(String).slice(0,3).join(" • "):typeof rawGenre==="string"?rawGenre:"Drama";return{id:`sansekai:${slug}--${id}`,source:"captain",provider:slug,providerName:`${name} · Sansekai`,sourceId:id,title:t,synopsis:text(r,["synopsis","description","desc","intro","summary"])||"Sinopsis belum tersedia.",genre,cover:c,backdrop:c,episodes:eps};}

export async function getSansekaiCatalog(slug:string):Promise<Drama[]>{const cfg=ROUTES[slug];if(!cfg)return[];for(const path of cfg.catalog){try{const payload=await get(path);const seen=new Set<string>();const out=records(payload).map(r=>normalizeDrama(r,slug,cfg.name)).filter((x):x is Drama=>!!x).filter(x=>!seen.has(x.id)&&!!seen.add(x.id));if(out.length)return out.slice(0,40);}catch{}}return[];}

export async function getSansekaiDrama(fullId:string):Promise<Drama|null>{const m=fullId.match(/^sansekai:([^\-]+(?:-[^\-]+)*)--(.+)$/);if(!m)return null;const [,slug,id]=m;const cfg=ROUTES[slug];if(!cfg||!cfg.detail)return null;try{const detailPayload=await get(query(cfg.detail,id));const detail=records(detailPayload)[0]||(rec(detailPayload)?detailPayload:null);if(!detail)return null;let eps=episodeRecords(detailPayload).map(normalizeEpisode);if(!eps.length&&cfg.episodes){try{eps=episodeRecords(await get(query(cfg.episodes,id))).map(normalizeEpisode)}catch{}}
return normalizeDrama({...detail,id:rawId(detail)||id},slug,cfg.name,eps);}catch{return null;}}

export async function getSansekaiEpisodeStream(drama:Drama,episode:Episode):Promise<string|null>{if(episode.streamUrl)return episode.streamUrl;const cfg=ROUTES[drama.provider];if(!cfg?.play)return null;try{return stream(await get(query(cfg.play,drama.sourceId,episode)))||null}catch{return null;}}

export const SANSEKAI_ROUTE_SUMMARY = ROUTES;
