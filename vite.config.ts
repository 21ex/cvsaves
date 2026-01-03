import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  /* ▼ NEW — enables SPA fallback (fixes 404 on /login) */
  appType: "spa",
  /* ▲ ---------------------------------------------- */

  base:
    process.env.NODE_ENV === "development"
      ? "/"
      : process.env.VITE_BASE_PATH || "/",

  plugins: [react()],

  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    // @ts-ignore
    allowedHosts: true,
  },
});
