import { NextRequest, NextResponse } from "next/server";
import { directoryProvider } from "@/lib/provider-directory";
import { getProviderCatalog, getProviderDrama, getProviderEpisodeStream } from "@/lib/captain-multi";
import { getSansekaiCatalog, getSansekaiDrama, getSansekaiEpisodeStream } from "@/lib/sansekai";
import { PROVIDER_ROUTES } from "@/lib/provider-routes";
import { SANSEKAI_ROUTE_SUMMARY } from "@/lib/sansekai";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") || "";
  const provider = directoryProvider(slug);
  if (!provider) return NextResponse.json({ ok:false, error:"unknown provider" }, { status:404 });

  const started = Date.now();
  const routes = provider.source === "captain" ? PROVIDER_ROUTES[slug] : SANSEKAI_ROUTE_SUMMARY[slug];
  const result:any = {
    ok: true,
    provider: provider.name,
    slug,
    source: provider.source,
    routes,
    catalog: { ok:false, count:0 },
    detail: { ok:false },
    episodes: { ok:false, count:0 },
    play: { ok:false, tested:false },
  };

  try {
    const catalog = provider.source === "captain" ? await getProviderCatalog(slug) : await getSansekaiCatalog(slug);
    result.catalog = { ok: catalog.length > 0, count: catalog.length, sample: catalog[0]?.title || null };
    const sample = catalog[0];
    if (sample) {
      const detail = provider.source === "captain" ? await getProviderDrama(sample.id) : await getSansekaiDrama(sample.id);
      result.detail = { ok: !!detail, title: detail?.title || null };
      result.episodes = { ok: !!detail?.episodes?.length, count: detail?.episodes?.length || 0 };
      const ep = detail?.episodes?.[0];
      // Playback audit is only attempted when a safe route exists in the registry.
      const hasSafePlay = provider.source === "captain" ? !!PROVIDER_ROUTES[slug]?.play?.length : !!SANSEKAI_ROUTE_SUMMARY[slug]?.play;
      if (detail && ep && hasSafePlay) {
        result.play.tested = true;
        const url = provider.source === "captain" ? await getProviderEpisodeStream(detail, ep) : await getSansekaiEpisodeStream(detail, ep);
        result.play.ok = !!url;
        result.play.type = url ? (url.includes(".m3u8") ? "HLS" : url.includes(".mp4") ? "MP4" : "URL") : null;
      }
    }
  } catch (error) {
    result.ok = false;
    result.error = error instanceof Error ? error.message : String(error);
  }

  result.durationMs = Date.now() - started;
  return NextResponse.json(result, { headers: { "Cache-Control":"no-store" } });
}
