import type { ProviderName } from "@/lib/providers";

type CacheEntry = {
  status: number;
  contentType: string;
  body: ArrayBuffer;
  expiresAt: number;
  staleUntil: number;
};

type CachedResult = CacheEntry & {
  cacheStatus: "HIT" | "MISS" | "STALE";
  ttlSeconds: number;
};

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry>>();

function envSeconds(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

export function resolveProviderTtl(path: string) {
  const clean = path.toLowerCase();

  // Stream/play URLs can expire, so keep these short.
  if (/stream|play|video|unlock|m3u8|episode\/play/.test(clean)) {
    return envSeconds("DRACIN_CACHE_STREAM_SECONDS", 180);
  }

  // Episode metadata changes rarely.
  if (/episode|episodes|chapter|chapters/.test(clean)) {
    return envSeconds("DRACIN_CACHE_EPISODES_SECONDS", 3600);
  }

  // Detail pages are stable enough to cache for a while.
  if (/detail|info|subject|book|drama/.test(clean)) {
    return envSeconds("DRACIN_CACHE_DETAIL_SECONDS", 1800);
  }

  // Search should feel fresh but still avoid repeated upstream hits.
  if (/search|query/.test(clean)) {
    return envSeconds("DRACIN_CACHE_SEARCH_SECONDS", 600);
  }

  // Home feeds / rankings / recommendations are shared by many users.
  return envSeconds("DRACIN_CACHE_FEED_SECONDS", 900);
}

export async function cachedProviderRequest(
  provider: ProviderName,
  path: string,
  fetcher: () => Promise<Response>,
): Promise<CachedResult> {
  const key = `${provider}:${path}`;
  const now = Date.now();
  const ttlSeconds = resolveProviderTtl(path);
  const staleSeconds = envSeconds("DRACIN_CACHE_STALE_SECONDS", 21600);
  const existing = cache.get(key);

  if (existing && existing.expiresAt > now) {
    return { ...existing, cacheStatus: "HIT", ttlSeconds };
  }

  const running = inflight.get(key);
  if (running) {
    const entry = await running;
    return { ...entry, cacheStatus: "HIT", ttlSeconds };
  }

  const request = (async () => {
    try {
      const response = await fetcher();
      const body = await response.arrayBuffer();
      const entry: CacheEntry = {
        status: response.status,
        contentType: response.headers.get("content-type") || "application/json",
        body,
        expiresAt: Date.now() + ttlSeconds * 1000,
        staleUntil: Date.now() + (ttlSeconds + staleSeconds) * 1000,
      };

      // Cache only successful GET responses. Rate-limit/error bodies should not poison cache.
      if (response.ok && ttlSeconds > 0) cache.set(key, entry);
      return entry;
    } catch (error) {
      // If upstream is temporarily down/rate-limited, old data is better than failing mobile UX.
      if (existing && existing.staleUntil > Date.now()) return existing;
      throw error;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, request);
  const entry = await request;
  const usedStale = existing === entry && entry.expiresAt <= now;
  return { ...entry, cacheStatus: usedStale ? "STALE" : "MISS", ttlSeconds };
}

export function getProviderCacheStats() {
  const now = Date.now();
  let fresh = 0;
  let stale = 0;
  for (const entry of cache.values()) {
    if (entry.expiresAt > now) fresh += 1;
    else if (entry.staleUntil > now) stale += 1;
  }
  return { entries: cache.size, fresh, stale, inflight: inflight.size };
}
