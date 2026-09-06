export type ProviderMode = "catalog" | "detail" | "episodes" | "play";

export type ProviderRoutes = Partial<Record<ProviderMode, string[]>>;

// Deterministic endpoint preferences derived from Captain's published Swagger docs.
// Risky routes explicitly described as unlock/decrypt/DRM/premium are intentionally omitted.
export const PROVIDER_ROUTES: Record<string, ProviderRoutes> = {
  flickreels: {
    catalog: ["/flickreels/api/v1/for-you", "/flickreels/api/v1/hot-rank"],
    episodes: ["/flickreels/api/v1/chapters/{id}"],
    play: ["/flickreels/api/v1/stream/{playletId}/{chapterId}"],
  },
  cashdrama: {
    catalog: ["/cashdrama/api/v1/home"],
    detail: ["/cashdrama/api/v1/drama/{vid}"],
    episodes: ["/cashdrama/api/v1/drama/{vid}/episodes"],
    play: ["/cashdrama/api/v1/play/{vid}/{ep}"],
  },
  shotshort: {
    catalog: ["/shotshort/api/popular"],
    detail: ["/shotshort/api/book/{id}"],
    episodes: ["/shotshort/api/book/{id}/episodes"],
    play: ["/shotshort/api/book/{bookId}/chapter/{chapterId}"],
  },
  bilitv: {
    catalog: ["/bilitv/api/v1/home", "/bilitv/api/v1/dramas", "/bilitv/api/v1/recommend"],
    detail: ["/bilitv/api/v1/drama/{id}"],
    play: ["/bilitv/api/v1/drama/{id}/episode/{ep}"],
  },
  dramabite: {
    catalog: ["/dramabite/api/v1/foryou", "/dramabite/api/v1/recommend", "/dramabite/api/v1/dramas"],
    detail: ["/dramabite/api/v1/drama/{id}"],
    play: ["/dramabite/api/v1/drama/{id}/episode/{ep}"],
  },
  dramanova: {
    catalog: ["/dramanova/api/v1/dramas", "/dramanova/api/v1/recommend"],
    detail: ["/dramanova/api/v1/drama/{id}"],
  },
  dramapops: {
    catalog: ["/dramapops/api/homepage", "/dramapops/api/drama/trending", "/dramapops/api/drama/popular", "/dramapops/api/drama"],
    detail: ["/dramapops/api/drama/{id}"],
    play: ["/dramapops/api/drama/{id}/{ep}"],
  },
  netshort: {
    catalog: ["/netshort/api/v1/feed/{page}", "/netshort/api/v1/explore/{page}", "/netshort/api/v1/new/{page}", "/netshort/api/v1/dubbing/{page}"],
    detail: ["/netshort/api/v1/detail/{id}"],
    play: ["/netshort/api/v1/episode/{id}/{episodeNo}"],
  },
  melolo: {
    catalog: ["/melolo/api/v1/bookmall", "/melolo/api/v1/rank", "/melolo/api/v1/anime"],
    detail: ["/melolo/api/v1/series", "/melolo/api/v1/book"],
  },
  shortmax: {
    catalog: ["/shortmax/api/v1/foryou", "/shortmax/api/v1/feed/recommend", "/shortmax/api/v1/feed/new", "/shortmax/api/v1/feed/ranked", "/shortmax/api/v1/home"],
    detail: ["/shortmax/api/v1/detail/{code}"],
  },
  starshort: {
    catalog: ["/starshort/api/v1/dramas", "/starshort/api/v1/dramas/new"],
    detail: ["/starshort/api/v1/dramas/{dramaId}"],
    episodes: ["/starshort/api/v1/dramas/{dramaId}/episodes"],
    play: ["/starshort/api/v1/dramas/{dramaId}/episodes/{epNum}"],
  },
  dotdrama: {
    catalog: ["/dotdrama/api/v1/dramas", "/dotdrama/api/v1/collections"],
    detail: ["/dotdrama/api/v1/dramas/{id}"],
  },
  microdrama: {
    catalog: ["/microdrama/api/v1/dramas"],
    detail: ["/microdrama/api/v1/dramas/{id}"],
  },
  meloshort: {
    catalog: ["/meloshort/api/v1/drama/all", "/meloshort/api/v1/dramas/discover", "/meloshort/api/v1/dramas/top"],
    episodes: ["/meloshort/api/v1/dramas/{id}/episodes"],
    play: ["/meloshort/api/v1/dramas/{id}/episodes/{chapter}"],
  },
  rapidtv: {
    catalog: ["/rapidtv/api/v1/dramas"],
    detail: ["/rapidtv/api/v1/dramas/{id}"],
    episodes: ["/rapidtv/api/v1/dramas/{id}/episodes"],
  },
  vigloo: {
    catalog: ["/vigloo/api/v1/browse", "/vigloo/api/v1/rank"],
    detail: ["/vigloo/api/v1/drama/{id}"],
  },
  sodareels: {
    catalog: ["/sodareels/api/v1/home"],
    detail: ["/sodareels/api/v1/info/{id}"],
  },
  radreels: {
    catalog: ["/radreels/api/v1/foryou", "/radreels/api/v1/home", "/radreels/api/v1/ranking"],
    detail: ["/radreels/api/v1/drama/{keyword}"],
    episodes: ["/radreels/api/v1/episodes/{fakeId}"],
    play: ["/radreels/api/v1/video/{videoFakeId}/{episodicDramaId}"],
  },
  dramarush: {
    catalog: ["/dramarush/api/v1/ranking"],
    detail: ["/dramarush/api/v1/drama/{id}"],
    episodes: ["/dramarush/api/v1/play/{id}"],
    play: ["/dramarush/api/v1/play/{id}/{ep}"],
  },
  reelshort: {
    catalog: ["/reelshort/api/v1/foryou", "/reelshort/api/v1/new", "/reelshort/api/v1/completed", "/reelshort/api/v1/romance", "/reelshort/api/v1/drama"],
    detail: ["/reelshort/api/v1/book/{id}"],
    episodes: ["/reelshort/api/v1/book/{id}/chapters"],
  },
  stardusttv: {
    catalog: ["/stardusttv/api/v1/homepage"],
    detail: ["/stardusttv/api/v1/video/{id}"],
    play: ["/stardusttv/api/v1/video/{id}/episode/{episode}"],
  },
  snackshort: {
    catalog: ["/snackshort/api/v1/home", "/snackshort/api/v1/browsing"],
    detail: ["/snackshort/api/v1/book/{bookId}"],
    episodes: ["/snackshort/api/v1/book/{bookId}/chapters"],
    play: ["/snackshort/api/v1/book/{bookId}/episode/{chapterId}"],
  },
  shorten: {
    catalog: ["/shorten/api/v1/editors", "/shorten/api/v1/exclusive", "/shorten/api/v1/dubbed", "/shorten/api/v1/releases", "/shorten/api/v1/explore"],
    detail: ["/shorten/api/v1/series/{slug}"],
  },
  flextv: {
    catalog: ["/flextv/api/v1/tabs/{id}"],
    detail: ["/flextv/api/v1/series/{id}"],
    episodes: ["/flextv/api/v1/series/{id}/episodes"],
    play: ["/flextv/api/v1/play/{series_id}/{section_id}"],
  },
  shortsky: {
    catalog: ["/shortsky/api/home", "/shortsky/api/recommend"],
    detail: ["/shortsky/api/drama/{id}"],
    play: ["/shortsky/api/drama/{id}/episode/{ep}"],
  },
  shortbox: {
    catalog: ["/shortbox/api/for-you", "/shortbox/api/recommend", "/shortbox/api/new-list", "/shortbox/api/list"],
    detail: ["/shortbox/api/info/{id}"],
  },
  cubetv: {
    catalog: ["/cubetv/shows", "/cubetv/home/recommendations", "/cubetv/home/trending", "/cubetv/home/romance", "/cubetv/home/shows"],
    detail: ["/cubetv/search/{videoid}/episodes"],
    episodes: ["/cubetv/episode/{videoid}/list"],
    play: ["/cubetv/stream/{videoid}/{episodeid}"],
  },
  sereal: {
    catalog: ["/sereal/api/index/for-you/{page}", "/sereal/api/index/home/{page}", "/sereal/api/index/trending", "/sereal/api/content/recommend-smart/{page}"],
    detail: ["/sereal/api/content/detail"],
    play: ["/sereal/api/watch/{contentId}/{ep}"],
  },
  "dramabox-baru": {
    catalog: ["/dramaboxbaru/api/home", "/dramaboxbaru/api/rank", "/dramaboxbaru/api/recommend/book", "/dramaboxbaru/api/hidden-gems"],
    detail: ["/dramaboxbaru/api/drama/{bookId}"],
    play: ["/dramaboxbaru/api/stream"],
  },
  wetv: {
    catalog: ["/wetv/api/feed"],
    detail: ["/wetv/api/detail"],
    episodes: ["/wetv/api/episodes"],
    play: ["/wetv/api/play"],
  },
  moviebox: {
    catalog: ["/moviebox/api/tabs/home-content"],
    detail: ["/moviebox/api/subject/get", "/moviebox/api/shorts/info"],
    play: ["/moviebox/api/stream/{id}", "/moviebox/api/shorts/mini-list"],
  },
  anichin: {
    catalog: ["/anichin/home", "/anichin/ongoing/{page?}", "/anichin/completed/{page?}"],
    detail: ["/anichin/anime/{slug}"],
    play: ["/anichin/episode/{slug}"],
  },
  playlet: {
    catalog: ["/playlet/shorts/recommend", "/playlet/new-arrivals", "/playlet/column"],
    detail: ["/playlet/theater/{id}"],
  },
  raptdrama: {
    catalog: ["/raptdrama/open/recommend", "/raptdrama/open/trending", "/raptdrama/open/new"],
    episodes: ["/raptdrama/video/getchapters"],
    play: ["/raptdrama/video/playlist"],
  },
  bonustv: {
    catalog: ["/bonustv/api/modules", "/bonustv/api/recommend", "/bonustv/api/videos/recently", "/bonustv/api/shorts"],
    detail: ["/bonustv/api/video/{id}"],
    play: ["/bonustv/api/stream/{id}"],
  },
  flareflow: {
    catalog: ["/flareflow/api/foryou/list", "/flareflow/api/popular/list", "/flareflow/api/home"],
    detail: ["/flareflow/api/drama/{id}"],
    play: ["/flareflow/api/drama/{id}/play"],
  },
  reelbuzz: {
    catalog: ["/reelbuzz/api/drama/display", "/reelbuzz/api/drama/list", "/reelbuzz/api/drama/module/recommend"],
    detail: ["/reelbuzz/api/drama/detail"],
  },
  luminareels: {
    catalog: ["/luminareels/api/drama/list"],
    detail: ["/luminareels/api/drama/detail"],
  },
};

export function preferredRoutes(slug: string, mode: ProviderMode): string[] {
  return PROVIDER_ROUTES[slug]?.[mode] ?? [];
}
