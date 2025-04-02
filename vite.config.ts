import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      exclude: ["lucide-react"],
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:3000/api",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL":
        "'https://quqzfvucxdvlqvnjnwkn.supabase.co'",
      "import.meta.env.VITE_SUPABASE_ANON_KEY":
        "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1cXpmdnVjeGR2bHF2bmpud2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMDk4OTEsImV4cCI6MjA1Nzg4NTg5MX0.VHJQ_esE8FwJ54eeg_nUelxvB4Sy9vctnouVaThQip0'",
    },
    envPrefix: ["VITE_"],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            pdfjs: ["pdfjs-dist"],
            worker: ["src/workers/pdf.worker.js"],
          },
        },
      },
    },
    worker: {
      format: "es",
    },
  };
});
