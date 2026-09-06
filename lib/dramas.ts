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
  provider: "freereels";
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
const LANGUAGE = "id-ID";
const FEED_PATH = `/freereels/api/v1/foryou?page=1&lang=${LANGUAGE}`;

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
      const label = text(item, ["name", "title", "label", "genre", "tag_name", "tagName"]);
      return label ? [label] : [];
    }
    return [];
  });
}

function firstImage(record: JsonRecord): string {
  const direct = text(record, [
    "cover",
    "cover_url",
    "coverUrl",
    "poster",
    "poster_url",
    "posterUrl",
    "image",
    "image_url",
    "imageUrl",
    "img",
    "bookCover",
    "book_cover",
    "thumb",
    "thumbnail",
  ]);
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
  return text(record, [
    "id",
    "drama_id",
    "dramaId",
    "book_id",
    "bookId",
    "playlet_id",
    "playletId",
    "series_id",
    "seriesId",
    "short_play_id",
    "shortPlayId",
  ]);
}

function rawTitle(record: JsonRecord): string {
  return text(record, [
    "title",
    "name",
    "drama_name",
    "dramaName",
    "book_name",
    "bookName",
    "series_name",
    "seriesName",
    "short_play_name",
    "shortPlayName",
  ]);
}

function findDramaObjects(value: unknown, depth = 0): JsonRecord[] {
  if (depth > 8) return [];

  if (Array.isArray(value)) {
    const direct = value.filter(isRecord).filter((item) => rawDramaId(item) && rawTitle(item));
    if (direct.length) return direct;
    return value.flatMap((item) => findDramaObjects(item, depth + 1));
  }

  if (isRecord(value)) {
    for (const key of [
      "data",
      "list",
      "items",
      "dramas",
      "books",
      "results",
      "recommend",
      "recommendations",
      "records",
      "content",
      "rows",
    ]) {
      if (key in value) {
        const found = findDramaObjects(value[key], depth + 1);
        if (found.length) return found;
      }
    }
    return Object.values(value).flatMap((item) => findDramaObjects(item, depth + 1));
  }

  return [];
}

function findDetailObject(value: unknown, depth = 0): JsonRecord | null {
  if (depth > 8) return null;
  if (isRecord(value)) {
    if (rawDramaId(value) || rawTitle(value)) return value;
    for (const key of ["data", "detail", "drama", "book", "result", "content"]) {
      const child = value[key];
      if (isRecord(child)) {
        const found = findDetailObject(child, depth + 1);
        if (found) return found;
      }
    }
    for (const child of Object.values(value)) {
      const found = findDetailObject(child, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function episodeArray(value: unknown, depth = 0): JsonRecord[] {
  if (depth > 8) return [];

  if (Array.isArray(value)) {
    const records = value.filter(isRecord);
    const episodeLike = records.filter((item) =>
      Boolean(
        numberValue(item, [
          "episode",
          "episode_no",
          "episodeNo",
          "ep",
          "ep_num",
          "epNum",
          "chapter_num",
          "chapterNum",
          "index",
          "sort",
          "episode_index",
          "episodeIndex",
        ]) || text(item, ["episode_id", "episodeId", "chapter_id", "chapterId", "video_id", "videoId"]),
      ),
    );
    if (episodeLike.length) return episodeLike;
    return value.flatMap((item) => episodeArray(item, depth + 1));
  }

  if (isRecord(value)) {
    for (const key of [
      "episodes",
      "episode_list",
      "episodeList",
      "chapters",
      "chapter_list",
      "chapterList",
      "video_list",
      "videoList",
      "list",
      "items",
      "data",
      "content",
    ]) {
      if (key in value) {
        const found = episodeArray(value[key], depth + 1);
        if (found.length) return found;
      }
    }
    return Object.values(value).flatMap((item) => episodeArray(item, depth + 1));
  }

  return [];
}

function normalizeEpisode(item: JsonRecord, index: number): Episode {
  const number =
    numberValue(item, [
      "episode",
      "episode_no",
      "episodeNo",
      "ep",
      "ep_num",
      "epNum",
      "chapter_num",
      "chapterNum",
      "index",
      "sort",
      "episode_index",
      "episodeIndex",
    ]) || index + 1;
  const sourceId = text(item, ["id", "episode_id", "episodeId", "chapter_id", "chapterId", "video_id", "videoId"]);

  return {
    id: sourceId || `ep-${number}`,
    sourceId: sourceId || String(number),
    number,
    title: text(item, ["title", "name", "episode_name", "episodeName", "chapter_name", "chapterName"]) || `Episode ${number}`,
    streamUrl: extractStreamUrl(item) || undefined,
  };
}

function normalizeDrama(item: JsonRecord, episodes: Episode[] = []): Drama | null {
  const sourceId = rawDramaId(item);
  const title = rawTitle(item);
  if (!sourceId || !title) return null;

  const genres = ["genres", "genre", "tags", "categories", "tag_list", "tagList"].flatMap((key) => stringList(item[key]));
  const cover = firstImage(item);

  return {
    id: `freereels--${sourceId}`,
    source: "captain",
    provider: "freereels",
    sourceId,
    title,
    synopsis: text(item, ["synopsis", "description", "desc", "intro", "summary", "abstract", "introduction"]) || "Sinopsis belum tersedia.",
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
    console.error("DRACIN FreeReels catalog failed", error);
    return [];
  }
}

export async function getDrama(id: string): Promise<Drama | null> {
  if (!id.startsWith("freereels--")) return null;
  const sourceId = id.slice("freereels--".length);
  if (!sourceId) return null;

  try {
    const encodedId = encodeURIComponent(sourceId);
    const [detailPayload, episodesPayload] = await Promise.all([
      captainJson(`/freereels/api/v1/dramas/${encodedId}?lang=${LANGUAGE}`),
      captainJson(`/freereels/api/v1/dramas/${encodedId}/episodes?lang=${LANGUAGE}`),
    ]);

    const record = findDetailObject(detailPayload);
    if (!record) return null;

    let episodes = episodeArray(episodesPayload).map(normalizeEpisode).sort((a, b) => a.number - b.number);

    if (episodes.length === 0) {
      const total = numberValue(record, [
        "episode_count",
        "episodeCount",
        "total_episode",
        "totalEpisode",
        "total_episodes",
        "totalEpisodes",
        "chapter_count",
        "chapterCount",
      ]);
      if (total > 0 && total <= 500) {
        episodes = Array.from({ length: total }, (_, i) => ({
          id: `ep-${i + 1}`,
          sourceId: String(i + 1),
          number: i + 1,
          title: `Episode ${i + 1}`,
        }));
      }
    }

    return normalizeDrama({ ...record, id: rawDramaId(record) || sourceId }, episodes);
  } catch (error) {
    console.error(`DRACIN FreeReels detail failed for ${sourceId}`, error);
    return null;
  }
}

export function extractStreamUrl(value: unknown, depth = 0): string {
  if (depth > 9) return "";

  if (typeof value === "string") {
    if (/^https?:\/\/[^\s]+\.(m3u8|mp4)(\?|$)/i.test(value)) return value;
    if (/^https?:\/\//i.test(value) && /(m3u8|mp4|video|stream|play)/i.test(value)) return value;
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
    for (const key of [
      "m3u8",
      "m3u8_url",
      "m3u8Url",
      "video_url",
      "videoUrl",
      "play_url",
      "playUrl",
      "stream_url",
      "streamUrl",
      "url",
      "src",
      "playAddress",
      "play_address",
    ]) {
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
    const payload = await captainJson(
      `/freereels/api/v1/dramas/${encodeURIComponent(drama.sourceId)}/play/${episodeNumber}?lang=${LANGUAGE}`,
    );
    return extractStreamUrl(payload) || null;
  } catch (error) {
    console.error(`DRACIN FreeReels stream failed for ${drama.sourceId} ep ${episodeNumber}`, error);
    return null;
  }
}
