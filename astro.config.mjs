// @ts-check
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  devToolbar: { enabled: false },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});