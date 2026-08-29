import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DRACIN",
    short_name: "DRACIN",
    description: "Streaming drama pendek premium",
    start_url: "/",
    display: "standalone",
    background_color: "#08090d",
    theme_color: "#08090d"
  };
}
