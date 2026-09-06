import { BottomNav, TopBar } from "@/components/AppChrome";
import { HistoryClient } from "@/components/DramaUI";

export default function HistoryPage(){return <main className="app-shell premium-shell"><div className="mobile-frame premium-frame"><TopBar title="Riwayat"/><section className="search-hero"><span className="eyebrow">Lanjut Nonton</span><h1>Riwayat Tontonan</h1><p>Episode terakhir yang dibuka akan tersimpan di perangkat.</p></section><section className="home-section premium-section"><HistoryClient/></section><BottomNav/></div></main>}
