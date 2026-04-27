import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("@supabase")) {
            return "supabase";
          }

          if (id.includes("@tanstack")) {
            return "react-query";
          }

          if (id.includes("react-router")) {
            return "router";
          }

          if (
            id.includes("@radix-ui") ||
            id.includes("cmdk") ||
            id.includes("sonner") ||
            id.includes("lucide-react") ||
            id.includes("vaul")
          ) {
            return "ui-kit";
          }

          if (id.includes("recharts")) {
            return "charts";
          }

          if (id.includes("react") || id.includes("scheduler")) {
            return "react-vendor";
          }
        },
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
