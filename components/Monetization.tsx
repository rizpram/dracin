import Script from "next/script";

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const saweriaUrl = process.env.NEXT_PUBLIC_SAWERIA_QR_URL || process.env.NEXT_PUBLIC_SAWERIA_URL;

export function MonetizationScripts() {
  if (!adsenseClient) return null;
  return (
    <Script
      id="adsense-loader"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
    />
  );
}

export function AdSlot({ slot, format = "auto" }: { slot?: string; format?: string }) {
  if (!adsenseClient || !slot) return null;
  return (
    <div className="ad-shell" aria-label="Iklan">
      <span className="ad-label">Iklan</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseClient}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <Script id={`adsense-slot-${slot}`} strategy="afterInteractive">{`(adsbygoogle = window.adsbygoogle || []).push({});`}</Script>
    </div>
  );
}

export function SupportButton() {
  if (!saweriaUrl) return null;
  return (
    <a className="support-fab" href={saweriaUrl} target="_blank" rel="noopener noreferrer" aria-label="Dukung DRACIN via Saweria QR">
      ❤ <span>Saweria</span>
    </a>
  );
}
