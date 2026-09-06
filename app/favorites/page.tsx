import { BottomNav, TopBar } from "@/components/AppChrome";
import { FavoritesClient } from "@/components/DramaUI";

export default function FavoritesPage(){return <main className="app-shell premium-shell"><div className="mobile-frame premium-frame"><TopBar title="Favorit"/><section className="search-hero"><span className="eyebrow">Koleksi Pribadi</span><h1>Drama Favorit</h1><p>Tersimpan lokal di perangkat ini.</p></section><section className="home-section premium-section"><FavoritesClient/></section><BottomNav/></div></main>}
