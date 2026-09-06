"use client";

export default function ErrorPage({reset}:{reset:()=>void}){return <main className="app-shell premium-shell"><div className="mobile-frame premium-frame"><section className="premium-empty" style={{margin:"80px 14px"}}><b>!</b><h2>Konten gagal dimuat</h2><p>Coba lagi. Provider lain tetap bisa dipakai.</p><button className="ghost-action" onClick={reset}>Coba Lagi</button></section></div></main>}
