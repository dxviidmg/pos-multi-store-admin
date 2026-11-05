import type { MetadataRoute } from "next";

/**
 * Web App Manifest: hace la app instalable (PWA). El nombre visible al
 * instalar y en la pantalla de inicio es "SVAdmin".
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SVAdmin",
    short_name: "SVAdmin",
    description: "Panel de administración de SmartVenta.",
    start_url: "/",
    display: "standalone",
    theme_color: "#171A4A",
    background_color: "#171A4A",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon-192.png", type: "image/png", sizes: "192x192", purpose: "any" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512", purpose: "any" },
      { src: "/icon-maskable-512.png", type: "image/png", sizes: "512x512", purpose: "maskable" },
    ],
  };
}
