import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Lets index.html read SITE_URL from .env as %SITE_URL%.
  envPrefix: ["VITE_", "SITE_"],
});
