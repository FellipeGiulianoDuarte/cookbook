import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cookbook",
    short_name: "Cookbook",
    description:
      "Brewing guide for V60 and AeroPress: sourced recipes, the setting for your grinder, and a brew timer.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#151210",
    theme_color: "#151210",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
