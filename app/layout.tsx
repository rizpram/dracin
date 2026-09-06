import type { Metadata } from "next";
import { MonetizationScripts } from "@/components/Monetization";
import "./globals.css";
import "./premium.css";

export const metadata: Metadata = {
  title: "DRACIN — Drama Pendek",
  description: "Streaming drama pendek premium, cepat, dan mobile-first.",
  manifest: "/manifest.webmanifest"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {children}
        <MonetizationScripts />
      </body>
    </html>
  );
}
