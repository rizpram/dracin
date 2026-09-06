"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function TopBar({ title }: { title?: string }) {
  const router = useRouter();
  const [query,setQuery]=useState("");
  function submit(e:FormEvent){e.preventDefault();const q=query.trim();if(q)router.push(`/search?q=${encodeURIComponent(q)}`)}
  return <header className="premium-topbar">
    <Link href="/" className="premium-brand">DRA<span>CIN</span><small>Drama Pendek</small></Link>
    {title ? <strong className="topbar-title">{title}</strong> : null}
    <form className="top-search" onSubmit={submit}><span>⌕</span><input aria-label="Cari drama" placeholder="Cari drama..." value={query} onChange={e=>setQuery(e.target.value)}/></form>
  </header>
}

export function BottomNav(){
  const pathname=usePathname();
  const items=[
    ["/","⌂","Home"],
    ["/discover","◉","Explore"],
    ["/favorites","♡","Favorit"],
    ["/history","◷","Riwayat"],
  ];
  return <nav className="premium-bottom-nav">{items.map(([href,icon,label])=><Link key={href} href={href} className={pathname===href||href!=="/"&&pathname.startsWith(href)?"active":""}><b>{icon}</b><span>{label}</span></Link>)}</nav>
}

export function ProviderBadge({name,source}:{name?:string;source?:string}){return <span className={`provider-source-badge ${source||"captain"}`}>{name||"Provider"}</span>}
