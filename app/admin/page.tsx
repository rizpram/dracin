import Link from "next/link";
import { TopBar } from "@/components/AppChrome";

export default function AdminPage(){return <main className="app-shell premium-shell"><div className="mobile-frame premium-frame"><TopBar title="Admin"/><section className="search-hero"><span className="eyebrow">Developer Tools</span><h1>DRACIN Admin</h1><p>Operational tools dipisahkan dari navigasi user umum.</p></section><section className="home-section premium-section"><div className="saved-list"><Link href="/audit"><span>✓</span><strong>Provider Live Audit</strong><small>Catalog · Detail · Episode · Safe Play</small></Link><Link href="/api/captain/registry"><span>⌘</span><strong>Captain Registry</strong><small>Swagger-derived endpoint registry</small></Link></div></section></div></main>}
