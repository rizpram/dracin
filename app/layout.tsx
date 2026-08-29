import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DRACIN — Drama Pendek",
  description: "Streaming drama pendek premium, cepat, dan mobile-first.",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
