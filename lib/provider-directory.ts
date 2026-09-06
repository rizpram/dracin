import { CAPTAIN_PROVIDERS, providerSlug } from "@/lib/captain-multi";

export type DirectoryProvider = {
  slug: string;
  name: string;
  source: "captain" | "sansekai";
  fallback?: boolean;
};

const captain = CAPTAIN_PROVIDERS.map((name) => ({ slug: providerSlug(name), name, source: "captain" as const }));

// Only providers not present in Captain are added from Sansekai.
// Overlapping providers (ReelShort, ShortMax, NetShort, Melolo, FreeReels, DramaNova, MovieBox)
// stay Captain-first to avoid duplicate menus and Sansekai's 10 req/min demo limit.
const sansekaiOnly: DirectoryProvider[] = [
  { slug: "pinedrama", name: "PineDrama", source: "sansekai", fallback: true },
  { slug: "dramabox", name: "DramaBox", source: "sansekai", fallback: true },
  { slug: "goodshort", name: "GoodShort", source: "sansekai", fallback: true },
  { slug: "mydrama", name: "My Drama", source: "sansekai", fallback: true },
  { slug: "anime-sansekai", name: "Anime", source: "sansekai", fallback: true },
  { slug: "komik", name: "Komik", source: "sansekai", fallback: true },
];

export const PROVIDER_DIRECTORY: DirectoryProvider[] = [...captain, ...sansekaiOnly];

export function directoryProvider(slug: string): DirectoryProvider | null {
  return PROVIDER_DIRECTORY.find((p) => p.slug === slug) || null;
}

export function isSansekaiProvider(slug: string): boolean {
  return sansekaiOnly.some((p) => p.slug === slug);
}
