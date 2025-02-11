// @ts-check
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  devToolbar: { enabled: false },
  env: {
    schema: {
      SB_DB_SR_KEY: envField.string({ context: "server", access: "secret" }),
      PUBLIC_SB_PROJECT_ID: envField.string({
        context: "server",
        access: "public",
      }),
      DATABASE_URL: envField.string({ context: "server", access: "secret" }),
      DIRECT_URL: envField.string({ context: "server", access: "secret" }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@prisma/client"],
    },
    build: {
      rollupOptions: {
        external: ["@prisma/client"],
        output: {
          globals: {
            "@prisma/client": "PrismaClient",
          },
        },
      },
    },
  },
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
});
