import { providerFetch } from "@/lib/providers";
import { getProviderDrama, getProviderEpisodeStream } from "@/lib/captain-multi";
import { getSansekaiDrama, getSansekaiEpisodeStream } from "@/lib/sansekai";

export type Episode = { id: string; number: number; title: string; streamUrl?: string; sourceId?: string };
export type Drama = { id: string; source: "captain"; provider: string; providerName?: string; sourceId: string; title: string; synopsis: string; genre: string; cover: string; backdrop: string; episodes: Episode[] };
type JsonRecord = Record<string, unknown>;

const PLACEHOLDER_POSTER = "https://placehold.co/720x1280/111111/eeeeee?text=DRACIN";
const LANGUAGE = "id-ID";
const FEED_LIMIT = 50;
const FEED_MAX_REQUESTS = 5;
const CACHE_TTL_MS = 5 * 60 * 1000;
let dramasCache: { expiresAt: number; value: Drama[] } | null = null;

function isRecord(value: unknown): value is JsonRecord { return Boolean(value) && typeof value === "object" && !Array.isArray(value) }
function text(record: JsonRecord, keys: string[]): string { for (const key of keys) { const value=record[key]; if(typeof value==="string"&&value.trim()) return value.trim(); if(typeof value==="number") return String(value) } return "" }
function numberValue(record: JsonRecord, keys: string[]): number { for(const key of keys){const value=record[key];const n=typeof value==="number"?value:Number(value);if(Number.isFinite(n)&&n>0)return n}return 0 }
function stringList(value: unknown): string[] { if(typeof value==="string") return value.split(/[,|/]/).map(v=>v.trim()).filter(Boolean); if(!Array.isArray(value)) return []; return value.flatMap(item=>typeof item==="string"?[item]:isRecord(item)?[text(item,["name","title","label","genre","tag_name","tagName","text"])].filter(Boolean):[]) }
function firstImage(record: JsonRecord): string { const direct=text(record,["cover","cover_url","coverUrl","poster","poster_url","posterUrl","image","image_url","imageUrl","img","bookCover","book_cover","thumb","thumbnail"]); if(/^https?:\/\//i.test(direct))return direct; for(const value of Object.values(record)){if(isRecord(value)){const nested=firstImage(value);if(nested!==PLACEHOLDER_POSTER)return nested}}return PLACEHOLDER_POSTER }
function rawDramaId(record: JsonRecord): string { return text(record,["key","id","drama_id","dramaId","book_id","bookId","playlet_id","playletId","series_key","seriesKey","series_id","seriesId","short_play_id","shortPlayId"]) }
function rawTitle(record: JsonRecord): string { return text(record,["title","name","drama_name","dramaName","book_name","bookName","series_name","seriesName","short_play_name","shortPlayName"]) }
function findDramaObjects(value: unknown, depth=0): JsonRecord[]{if(depth>8)return[];if(Array.isArray(value)){const direct=value.filter(isRecord).filter(item=>rawDramaId(item)&&rawTitle(item));if(direct.length)return direct;return value.flatMap(item=>findDramaObjects(item,depth+1))}if(isRecord(value)){for(const key of["data","list","items","dramas","books","results","recommend","recommendations","records","content","rows"]){if(key in value){const found=findDramaObjects(value[key],depth+1);if(found.length)return found}}return Object.values(value).flatMap(item=>findDramaObjects(item,depth+1))}return[]}
function findDetailObject(value: unknown, depth=0): JsonRecord|null{if(depth>8)return null;if(isRecord(value)){if(rawDramaId(value)||rawTitle(value))return value;for(const key of["data","detail","drama","book","result","content"]){const child=value[key];if(isRecord(child)){const found=findDetailObject(child,depth+1);if(found)return found}}for(const child of Object.values(value)){const found=findDetailObject(child,depth+1);if(found)return found}}return null}
function episodeArray(value:unknown,depth=0):JsonRecord[]{if(depth>8)return[];if(Array.isArray(value)){const records=value.filter(isRecord);const eps=records.filter(item=>Boolean(numberValue(item,["episode","episode_no","episodeNo","ep","ep_num","epNum","chapter_num","chapterNum","index","sort","episode_index","episodeIndex"])||text(item,["episode_id","episodeId","chapter_id","chapterId","video_id","videoId","key","id"])));if(eps.length)return eps;return value.flatMap(item=>episodeArray(item,depth+1))}if(isRecord(value)){for(const key of["episodes","episode_list","episodeList","chapters","chapter_list","chapterList","video_list","videoList","list","items","data","content"]){if(key in value){const found=episodeArray(value[key],depth+1);if(found.length)return found}}return Object.values(value).flatMap(item=>episodeArray(item,depth+1))}return[]}
function normalizeEpisode(item:JsonRecord,index:number):Episode{const number=numberValue(item,["episode","episode_no","episodeNo","ep","ep_num","epNum","chapter_num","chapterNum","index","sort","episode_index","episodeIndex"])||index+1;const sourceId=text(item,["key","id","episode_id","episodeId","chapter_id","chapterId","video_id","videoId"]);return{id:sourceId||`ep-${number}`,sourceId:sourceId||String(number),number,title:text(item,["title","name","episode_name","episodeName","chapter_name","chapterName"])||`Episode ${number}`,streamUrl:extractStreamUrl(item)||undefined}}
function normalizeDrama(item:JsonRecord,episodes:Episode[]=[]):Drama|null{const sourceId=rawDramaId(item),title=rawTitle(item);if(!sourceId||!title)return null;const genres=["genres","genre","tags","tag","content_tags","categories","tag_list","tagList"].flatMap(key=>stringList(item[key]));const cover=firstImage(item);return{id:`freereels--${sourceId}`,source:"captain",provider:"freereels",providerName:"FreeReels",sourceId,title,synopsis:text(item,["synopsis","description","desc","intro","summary","abstract","introduction"])||"Sinopsis belum tersedia.",genre:genres.slice(0,3).join(" • ")||"Drama",cover,backdrop:text(item,["backdrop","banner","background","background_url","backgroundUrl"])||cover,episodes}}
function sleep(ms:number){return new Promise(resolve=>setTimeout(resolve,ms))}
function truncated(value:unknown){try{return JSON.stringify(value).slice(0,500)}catch{return String(value).slice(0,500)}}

async function captainJson(path:string):Promise<unknown>{
  const response=await providerFetch("captain",path);
  if(!response.ok)throw new Error(`Captain ${response.status} for ${path}`);
  return response.json();
}

async function captainDetailJson(path:string,id:string):Promise<{payload:unknown;status:number}>{
  console.log("[DRACIN]","detail-request",{provider:"freereels",id,endpoint:path});
  const response=await providerFetch("captain",path);
  console.log("[DRACIN]","detail-response",{provider:"freereels",id,endpoint:path,status:response.status});
  const raw=await response.text();
  if(!response.ok)throw new Error(`Captain ${response.status} for ${path}: ${raw.slice(0,500)}`);
  try{return{payload:raw?JSON.parse(raw):null,status:response.status}}catch(error){
    console.log("[DRACIN]","detail-normalize-failed",{provider:"freereels",id,error:error instanceof Error?error.message:String(error),payload:raw.slice(0,500)});
    throw error;
  }
}

function nextFeedQuery(payload:unknown):string|null{if(!isRecord(payload)||!isRecord(payload.page_info))return null;const next=text(payload.page_info,["next"]);const hasMore=payload.page_info.has_more;return hasMore===false||!next?null:next.replace(/^\?/,"")}

export async function getDramas():Promise<Drama[]>{
  if(dramasCache&&dramasCache.expiresAt>Date.now())return dramasCache.value;
  try{const seen=new Set<string>();const dramas:Drama[]=[];let nextQuery="page=1";for(let requestNo=0;requestNo<FEED_MAX_REQUESTS&&dramas.length<FEED_LIMIT;requestNo++){const separator=nextQuery?`&${nextQuery}`:"";const payload=await captainJson(`/freereels/api/v1/foryou?lang=${LANGUAGE}${separator}`);for(const item of findDramaObjects(payload)){const drama=normalizeDrama(item);if(drama&&!seen.has(drama.id)){seen.add(drama.id);dramas.push(drama);if(dramas.length>=FEED_LIMIT)break}}const next=nextFeedQuery(payload);if(!next)break;nextQuery=next}dramasCache={expiresAt:Date.now()+CACHE_TTL_MS,value:dramas};return dramas}catch(error){console.error("DRACIN FreeReels catalog failed",error);return dramasCache?.value||[]}}

async function loadDramaOnce(id:string):Promise<Drama|null>{
  if(id.startsWith("sansekai:")){
    console.log("[DRACIN]","detail-request",{provider:"sansekai",id,endpoint:"sansekai:auto-detail"});
    const result=await getSansekaiDrama(id);
    console.log("[DRACIN]","detail-response",{provider:"sansekai",id,endpoint:"sansekai:auto-detail",status:result?200:204});
    if(!result)console.log("[DRACIN]","detail-normalize-failed",{provider:"sansekai",id,error:"Adapter returned null",payload:"raw payload unavailable at wrapper"});
    return result;
  }
  if(!id.startsWith("freereels--")){
    const provider=id.split("--",1)[0]||"captain";
    console.log("[DRACIN]","detail-request",{provider,id,endpoint:"captain:auto-detail"});
    const result=await getProviderDrama(id);
    console.log("[DRACIN]","detail-response",{provider,id,endpoint:"captain:auto-detail",status:result?200:204});
    if(!result)console.log("[DRACIN]","detail-normalize-failed",{provider,id,error:"Adapter returned null",payload:"raw payload unavailable at wrapper"});
    return result;
  }

  const sourceId=id.slice("freereels--".length);if(!sourceId)return null;
  const encodedId=encodeURIComponent(sourceId);
  const detailEndpoint=`/freereels/api/v1/dramas/${encodedId}?lang=${LANGUAGE}`;
  const episodesEndpoint=`/freereels/api/v1/dramas/${encodedId}/episodes?lang=${LANGUAGE}`;
  try{
    const[detailResult,episodesResult]=await Promise.all([captainDetailJson(detailEndpoint,sourceId),captainDetailJson(episodesEndpoint,sourceId)]);
    const detailPayload=detailResult.payload;const episodesPayload=episodesResult.payload;
    const record=findDetailObject(detailPayload);
    if(!record){console.log("[DRACIN]","detail-normalize-failed",{provider:"freereels",id:sourceId,error:"Detail object tidak ditemukan",payload:truncated(detailPayload)});return null}
    let episodes=episodeArray(episodesPayload).map(normalizeEpisode).sort((a,b)=>a.number-b.number);
    if(episodes.length===0){const total=numberValue(record,["episode_count","episodeCount","total_episode","totalEpisode","total_episodes","totalEpisodes","chapter_count","chapterCount"]);if(total>0&&total<=500)episodes=Array.from({length:total},(_,i)=>({id:`ep-${i+1}`,sourceId:String(i+1),number:i+1,title:`Episode ${i+1}`}))}
    const normalized=normalizeDrama({...record,key:rawDramaId(record)||sourceId},episodes);
    if(!normalized)console.log("[DRACIN]","detail-normalize-failed",{provider:"freereels",id:sourceId,error:"normalizeDrama returned null",payload:truncated(detailPayload)});
    return normalized;
  }catch(error){
    console.log("[DRACIN]","detail-normalize-failed",{provider:"freereels",id:sourceId,error:error instanceof Error?error.message:String(error),payload:"request failed before payload could be normalized"});
    return null;
  }
}

export async function getDrama(id:string):Promise<Drama|null>{
  for(let attempt=0;attempt<2;attempt++){
    const result=await loadDramaOnce(id);
    if(result)return result;
    if(attempt===0)await sleep(1500);
  }
  return null;
}

export function extractStreamUrl(value:unknown,depth=0):string{if(depth>9)return"";if(typeof value==="string"){if(/^https?:\/\/[^\s]+\.(m3u8|mp4)(\?|$)/i.test(value))return value;if(/^https?:\/\//i.test(value)&&/(m3u8|mp4|video|stream|play)/i.test(value))return value;return""}if(Array.isArray(value)){for(const item of value){const found=extractStreamUrl(item,depth+1);if(found)return found}return""}if(isRecord(value)){for(const key of["external_audio_h264_m3u8","external_audio_h265_m3u8","m3u8","m3u8_url","m3u8Url","video_url","videoUrl","play_url","playUrl","stream_url","streamUrl","url","src","playAddress","play_address"]){const found=extractStreamUrl(value[key],depth+1);if(found)return found}for(const child of Object.values(value)){const found=extractStreamUrl(child,depth+1);if(found)return found}}return""}
export async function getEpisodeStream(drama:Drama,episodeNumber:number):Promise<string|null>{const episode=drama.episodes.find(ep=>ep.number===episodeNumber);if(episode?.streamUrl)return episode.streamUrl;if(!episode)return null;if(drama.id.startsWith("sansekai:"))return getSansekaiEpisodeStream(drama,episode);if(drama.provider!=="freereels")return getProviderEpisodeStream(drama,episode);try{const payload=await captainJson(`/freereels/api/v1/dramas/${encodeURIComponent(drama.sourceId)}/play/${episodeNumber}?lang=${LANGUAGE}`);return extractStreamUrl(payload)||null}catch(error){console.error(`DRACIN FreeReels stream failed for ${drama.sourceId} ep ${episodeNumber}`,error);return null}}
