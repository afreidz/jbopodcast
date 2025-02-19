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
      PB_SUPERUSER_TOKEN: envField.string({
        context: "server",
        access: "secret",
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
