import { providerFetch } from "@/lib/providers";

export type Episode = {
  id: string;
  number: number;
  title: string;
  streamUrl?: string;
  sourceId?: string;
};

export type Drama = {
  id: string;
  source: "captain";
  provider: "flickshort";
  sourceId: string;
  title: string;
  synopsis: string;
  genre: string;
  cover: string;
  backdrop: string;
  episodes: Episode[];
};

type JsonRecord = Record<string, unknown>;

const PLACEHOLDER_POSTER = "https://placehold.co/720x1280/111111/eeeeee?text=DRACIN";
const FEED_PATH = "/flickshort/api/v1/recommend?page=1&limit=30&lang=id&origin=auto";

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(record: JsonRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function numberValue(record: JsonRecord, keys: string[]): number {
  for (const key of keys) {
    const value = record[key];
    const n = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function stringList(value: unknown): string[] {
  if (typeof value === "string") return value.split(/[,|/]/).map((v) => v.trim()).filter(Boolean);
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === "string") return item;
    if (isRecord(item)) {
      const label = text(item, ["name", "title", "label", "genre"]);
      return label ? [label] : [];
    }
    return [];
  });
}

function firstImage(record: JsonRecord): string {
  const direct = text(record, ["cover", "cover_url", "coverUrl", "poster", "poster_url", "posterUrl", "image", "image_url", "imageUrl", "img", "bookCover", "book_cover", "thumb", "thumbnail"]);
  if (/^https?:\/\//i.test(direct)) return direct;
  for (const value of Object.values(record)) {
    if (isRecord(value)) {
      const nested = firstImage(value);
      if (nested !== PLACEHOLDER_POSTER) return nested;
    }
  }
  return PLACEHOLDER_POSTER;
}

function rawDramaId(record: JsonRecord): string {
  return text(record, ["id", "drama_id", "dramaId", "book_id", "bookId", "playlet_id", "playletId", "series_id", "seriesId"]);
}

function rawTitle(record: JsonRecord): string {
  return text(record, ["title", "name", "drama_name", "dramaName", "book_name", "bookName", "series_name", "seriesName"]);
}

function findDramaObjects(value: unknown, depth = 0): JsonRecord[] {
  if (depth > 7) return [];
  if (Array.isArray(value)) {
    const direct = value.filter(isRecord).filter((item) => rawDramaId(item) && rawTitle(item));
    if (direct.length) return direct;
    return value.flatMap((item) => findDramaObjects(item, depth + 1));
  }
  if (isRecord(value)) {
    for (const key of ["data", "list", "items", "dramas", "books", "results", "recommend", "recommendations", "records"]) {
      if (key in value) {
        const found = findDramaObjects(value[key], depth + 1);
        if (found.length) return found;
      }
    }
    return Object.values(value).flatMap((item) => findDramaObjects(item, depth + 1));
  }
  return [];
}

function findDetailObject(value: unknown): JsonRecord | null {
  if (isRecord(value)) {
    if (rawDramaId(value) || rawTitle(value)) return value;
    for (const key of ["data", "detail", "drama", "book", "result"]) {
      const child = value[key];
      if (isRecord(child)) {
        const found = findDetailObject(child);
        if (found) return found;
      }
    }
  }
  return null;
}

function episodeArray(record: JsonRecord): JsonRecord[] {
  for (const key of ["episodes", "episode_list", "episodeList", "chapters", "chapter_list", "chapterList", "video_list", "videoList"]) {
    const value = record[key];
    if (Array.isArray(value)) return value.filter(isRecord);
    if (isRecord(value)) {
      const nested = Object.values(value).find(Array.isArray);
      if (Array.isArray(nested)) return nested.filter(isRecord);
    }
  }
  for (const value of Object.values(record)) {
    if (isRecord(value)) {
      const found = episodeArray(value);
      if (found.length) return found;
    }
  }
  return [];
}

function normalizeEpisode(item: JsonRecord, index: number): Episode {
  const number = numberValue(item, ["episode", "episode_no", "episodeNo", "ep", "ep_num", "epNum", "chapter_num", "chapterNum", "index", "sort"]) || index + 1;
  const sourceId = text(item, ["id", "episode_id", "episodeId", "chapter_id", "chapterId", "video_id", "videoId"]);
  return {
    id: sourceId || `ep-${number}`,
    sourceId: sourceId || String(number),
    number,
    title: text(item, ["title", "name", "episode_name", "episodeName", "chapter_name", "chapterName"]) || `Episode ${number}`,
    streamUrl: extractStreamUrl(item) || undefined,
  };
}

function normalizeDrama(item: JsonRecord, detailed = false): Drama | null {
  const sourceId = rawDramaId(item);
  const title = rawTitle(item);
  if (!sourceId || !title) return null;
  const genres = ["genres", "genre", "tags", "categories"].flatMap((key) => stringList(item[key]));
  const cover = firstImage(item);
  let episodes = detailed ? episodeArray(item).map(normalizeEpisode).sort((a, b) => a.number - b.number) : [];
  if (detailed && episodes.length === 0) {
    const total = numberValue(item, ["episode_count", "episodeCount", "total_episode", "totalEpisode", "total_episodes", "totalEpisodes", "chapter_count", "chapterCount"]);
    if (total > 0 && total <= 500) episodes = Array.from({ length: total }, (_, i) => ({ id: `ep-${i + 1}`, sourceId: String(i + 1), number: i + 1, title: `Episode ${i + 1}` }));
  }
  return {
    id: `flickshort--${sourceId}`,
    source: "captain",
    provider: "flickshort",
    sourceId,
    title,
    synopsis: text(item, ["synopsis", "description", "desc", "intro", "summary", "abstract"]) || "Sinopsis belum tersedia.",
    genre: genres.slice(0, 3).join(" • ") || "Drama",
    cover,
    backdrop: text(item, ["backdrop", "banner", "background", "background_url", "backgroundUrl"]) || cover,
    episodes,
  };
}

async function captainJson(path: string): Promise<unknown> {
  const response = await providerFetch("captain", path);
  if (!response.ok) throw new Error(`Captain ${response.status} for ${path}`);
  return response.json();
}

export async function getDramas(): Promise<Drama[]> {
  try {
    const payload = await captainJson(FEED_PATH);
    const seen = new Set<string>();
    return findDramaObjects(payload)
      .map((item) => normalizeDrama(item))
      .filter((item): item is Drama => Boolean(item))
      .filter((item) => !seen.has(item.id) && Boolean(seen.add(item.id)))
      .slice(0, 30);
  } catch (error) {
    console.error("DRACIN real catalog failed", error);
    return [];
  }
}

export async function getDrama(id: string): Promise<Drama | null> {
  if (!id.startsWith("flickshort--")) return null;
  const sourceId = id.slice("flickshort--".length);
  if (!sourceId) return null;
  try {
    const payload = await captainJson(`/flickshort/api/v1/drama/${encodeURIComponent(sourceId)}?lang=id`);
    const record = findDetailObject(payload);
    return record ? normalizeDrama({ ...record, id: rawDramaId(record) || sourceId }, true) : null;
  } catch (error) {
    console.error(`DRACIN detail failed for ${sourceId}`, error);
    return null;
  }
}

export function extractStreamUrl(value: unknown, depth = 0): string {
  if (depth > 8) return "";
  if (typeof value === "string") {
    if (/^https?:\/\/[^\s]+\.(m3u8|mp4)(\?|$)/i.test(value)) return value;
    return "";
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractStreamUrl(item, depth + 1);
      if (found) return found;
    }
    return "";
  }
  if (isRecord(value)) {
    for (const key of ["m3u8", "m3u8_url", "m3u8Url", "video_url", "videoUrl", "play_url", "playUrl", "stream_url", "streamUrl", "url"]) {
      const found = extractStreamUrl(value[key], depth + 1);
      if (found) return found;
    }
    for (const child of Object.values(value)) {
      const found = extractStreamUrl(child, depth + 1);
      if (found) return found;
    }
  }
  return "";
}

export async function getEpisodeStream(drama: Drama, episodeNumber: number): Promise<string | null> {
  const embedded = drama.episodes.find((ep) => ep.number === episodeNumber)?.streamUrl;
  if (embedded) return embedded;
  try {
    const payload = await captainJson(`/flickshort/api/v1/drama/${encodeURIComponent(drama.sourceId)}/episode/${episodeNumber}?lang=id`);
    return extractStreamUrl(payload) || null;
  } catch (error) {
    console.error(`DRACIN stream failed for ${drama.sourceId} ep ${episodeNumber}`, error);
    return null;
  }
}
