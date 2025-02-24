// @ts-check
import node from "@astrojs/node";
import svelte from "@astrojs/svelte";
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
      PUBLIC_LOCAL_RELAY: envField.string({
        context: "client",
        access: "public",
      }),
      PUBLIC_PB_ENDPOINT: envField.string({
        context: "client",
        access: "public",
      }),
      PB_SUPERUSER_TOKEN: envField.string({
        context: "server",
        access: "secret",
      }),
      PUBLIC_YT_CHANNEL: envField.string({
        context: "client",
        access: "public",
      }),
    },
  },

  adapter: node({
    mode: "standalone",
  }),
});
