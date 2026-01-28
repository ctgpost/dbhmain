import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === "production" ? visualizer({ open: false }) : null,
    mode === "development"
      ? {
          name: "inject-chef-dev",
          transform(code: string, id: string) {
            if (id.includes("main.tsx")) {
              return {
                code: `${code}

/* Added by Vite plugin inject-chef-dev */
window.addEventListener('message', async (message) => {
  if (message.source !== window.parent) return;
  if (message.data.type !== 'chefPreviewRequest') return;

  const worker = await import('https://chef.convex.dev/scripts/worker.bundled.mjs');
  await worker.respondToMessage(message);
});
            `,
                map: null,
              };
            }
            return null;
          },
        }
      : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor": ["react", "react-dom"],
          "ui": ["sonner", "jspdf", "html2canvas", "jsbarcode", "qrcode"],
        },
      },
    },
    // Target modern browsers for smaller bundle
    target: "ES2020",
    // CSS code splitting
    cssCodeSplit: true,
    // Source maps for production
    sourcemap: false,
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "convex", "sonner"],
    exclude: ["@vite/client", "@vite/env"],
  },
  // Server optimizations
  server: {
    middlewareMode: false,
  },
}));
