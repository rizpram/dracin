export type Episode = {
  id: string;
  number: number;
  title: string;
  streamUrl: string;
};

export type Drama = {
  id: string;
  title: string;
  synopsis: string;
  genre: string;
  cover: string;
  backdrop: string;
  episodes: Episode[];
};

const demoStream = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

export const fallbackDramas: Drama[] = [
  {
    id: "kontrak-cinta-ceo",
    title: "Kontrak Cinta Sang CEO",
    synopsis: "Kesepakatan palsu berubah menjadi hubungan yang terlalu nyata ketika dua orang dengan tujuan berbeda terpaksa hidup dalam satu cerita.",
    genre: "Romance",
    cover: "https://images.unsplash.com/photo-1496337589254-7e19d01cec44?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1600&q=80",
    episodes: Array.from({ length: 8 }, (_, i) => ({ id: `kc-${i + 1}`, number: i + 1, title: `Episode ${i + 1}`, streamUrl: demoStream }))
  },
  {
    id: "istri-rahasia",
    title: "Istri Rahasia Pewaris Kaya",
    synopsis: "Identitas yang disembunyikan mulai terbongkar saat keluarga, bisnis, dan cinta saling bertabrakan.",
    genre: "Drama",
    cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    episodes: Array.from({ length: 6 }, (_, i) => ({ id: `ir-${i + 1}`, number: i + 1, title: `Episode ${i + 1}`, streamUrl: demoStream }))
  },
  {
    id: "balas-dendam-pengantin",
    title: "Balas Dendam Sang Pengantin",
    synopsis: "Sebuah pernikahan menjadi pintu masuk untuk membongkar pengkhianatan lama dan mengambil kembali kehidupan yang dirampas.",
    genre: "Revenge",
    cover: "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80",
    episodes: Array.from({ length: 7 }, (_, i) => ({ id: `bd-${i + 1}`, number: i + 1, title: `Episode ${i + 1}`, streamUrl: demoStream }))
  }
];

export async function getDramas(): Promise<Drama[]> {
  return fallbackDramas;
}

export async function getDrama(id: string): Promise<Drama | null> {
  return fallbackDramas.find((drama) => drama.id === id) ?? null;
}
