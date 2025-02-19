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
      PUBLIC_PB_ENDPOINT: envField.string({
        context: "client",
        access: "public",
      }),
      PUBLIC_PULSE_API_KEY: envField.string({
        context: "client",
        access: "public",
      }),
      PUBLIC_SB_ANON_KEY: envField.string({
        context: "client",
        access: "public",
      }),
      PUBLIC_SB_PROJECT_URL: envField.string({
        context: "client",
        access: "public",
      }),
    },
  },

  vite: {
    resolve: {
      alias: {
        ".prisma/client/index-browser":
          "./node_modules/.prisma/client/index-browser.js",
      },
    },
    build: {
      cssCodeSplit: false,
    },
  },

  adapter: netlify({
    cacheOnDemandPages: false,
  }),
});
