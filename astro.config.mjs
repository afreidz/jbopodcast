// @ts-check
import svelte from "@astrojs/svelte";
import netlify from "@astrojs/netlify";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  devToolbar: { enabled: false },

  env: {
    schema: {
      SB_DB_SR_KEY: envField.string({ context: "server", access: "secret" }),
      DATABASE_URL: envField.string({ context: "server", access: "secret" }),
      DIRECT_URL: envField.string({ context: "server", access: "secret" }),
      PUBLIC_SB_ANON_KEY: envField.string({
        context: "client",
        access: "public",
      }),
      PUBLIC_SB_PROJECT_ID: envField.string({
        context: "client",
        access: "public",
      }),
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: netlify({
    cacheOnDemandPages: false,
  }),
});
