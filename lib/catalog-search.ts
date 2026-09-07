import { getDramas, type Drama } from "@/lib/dramas";
import { getProviderCatalog } from "@/lib/captain-multi";
import { getSansekaiCatalog } from "@/lib/sansekai";
import { directoryProvider } from "@/lib/provider-directory";

const CURATED=["flickreels","cubetv","netshort","reelshort","shortmax","pinedrama"];
const TTL_MS=5*60*1000;
const cache=new Map<string,{expiresAt:number;value:Drama[]}>();

function matches(drama:Drama,q:string){const hay=[drama.title,drama.synopsis,drama.genre,drama.providerName].join(" ").toLowerCase();return hay.includes(q.toLowerCase())}

async function catalog(slug:string):Promise<Drama[]>{
  const key=`catalog:${slug}`;const hit=cache.get(key);if(hit&&hit.expiresAt>Date.now())return hit.value;
  const provider=directoryProvider(slug);if(!provider)return[];
  const value=provider.source==="captain"?await getProviderCatalog(slug):await getSansekaiCatalog(slug);
  cache.set(key,{expiresAt:Date.now()+TTL_MS,value});
  return value;
}

export async function searchCatalogs(query:string,provider?:string):Promise<Drama[]>{
  const q=query.trim();if(!q)return[];
  const cacheKey=`search:${provider||"all"}:${q.toLowerCase()}`;const hit=cache.get(cacheKey);if(hit&&hit.expiresAt>Date.now())return hit.value;
  let result:Drama[]=[];
  if(provider&&provider!=="all"){
    try{result=(await catalog(provider)).filter(d=>matches(d,q)).slice(0,60)}catch{result=[]}
  }else{
    const defaultRows=await getDramas();const settled=await Promise.allSettled(CURATED.map(slug=>catalog(slug)));const rows=[...defaultRows,...settled.flatMap(x=>x.status==="fulfilled"?x.value:[])];const seen=new Set<string>();result=rows.filter(d=>matches(d,q)).filter(d=>{if(seen.has(d.id))return false;seen.add(d.id);return true}).slice(0,80);
  }
  cache.set(cacheKey,{expiresAt:Date.now()+TTL_MS,value:result});
  return result;
}
