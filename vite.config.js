import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.svg", "robots.txt", "sitemap.xml"],
            manifest: {
                name: "GirondeEntraide — Entraide d'urgence incendies Gironde",
                short_name: "Entraide33",
                description: "Plateforme d'entraide d'urgence pour les incendies en Gironde (33). Proposez ou demandez de l'aide : hébergement, transport, animaux, matériel.",
                theme_color: "#dc2626",
                background_color: "#0a0a0a",
                display: "standalone",
                orientation: "portrait",
                start_url: "/",
                scope: "/",
                lang: "fr-FR",
                dir: "ltr",
                categories: ["emergency", "social", "utilities"],
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            "@": "/src",
        },
    },
});
