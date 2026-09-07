import type { Metadata, Viewport } from "next";
import { MonetizationScripts } from "@/components/Monetization";
import RegisterSW from "@/components/RegisterSW";
import "./globals.css";
import "./premium.css";
import "./audit-fixes.css";

export const metadata: Metadata = {
  title: "DRACIN — Drama Pendek",
  description: "Streaming drama pendek premium, cepat, dan mobile-first.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#b41830",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {children}
        <RegisterSW />
        <MonetizationScripts />
      </body>
    </html>
  );
}
