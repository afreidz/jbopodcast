// @ts-check
import svelte from "@astrojs/svelte";
import netlify from "@astrojs/netlify";
import tailwind from "@astrojs/tailwind";
import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), tailwind({ applyBaseStyles: false })],
  devToolbar: { enabled: false },

  build: {
    inlineStylesheets: "never",
  },

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
    build: {
      cssCodeSplit: false,
    },
  },

  adapter: netlify({
    cacheOnDemandPages: false,
  }),
});
