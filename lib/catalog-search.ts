import { getDramas, type Drama } from "@/lib/dramas";
import { getProviderCatalog } from "@/lib/captain-multi";
import { getSansekaiCatalog } from "@/lib/sansekai";
import { directoryProvider } from "@/lib/provider-directory";

const CURATED=["flickreels","cubetv","netshort","reelshort","shortmax","pinedrama"];

function matches(drama:Drama,q:string){const hay=[drama.title,drama.synopsis,drama.genre,drama.providerName].join(" ").toLowerCase();return hay.includes(q.toLowerCase())}

async function catalog(slug:string):Promise<Drama[]>{const provider=directoryProvider(slug);if(!provider)return[];return provider.source==="captain"?getProviderCatalog(slug):getSansekaiCatalog(slug)}

export async function searchCatalogs(query:string,provider?:string):Promise<Drama[]>{const q=query.trim();if(!q)return[];if(provider&&provider!=="all"){try{return (await catalog(provider)).filter(d=>matches(d,q)).slice(0,60)}catch{return[]}}
  const defaultRows=await getDramas();const settled=await Promise.allSettled(CURATED.map(slug=>catalog(slug)));const rows=[...defaultRows,...settled.flatMap(x=>x.status==="fulfilled"?x.value:[])];const seen=new Set<string>();return rows.filter(d=>matches(d,q)).filter(d=>{if(seen.has(d.id))return false;seen.add(d.id);return true}).slice(0,80)}
