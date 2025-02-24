import * as cheerio from "cheerio";
import { defineAction } from "astro:actions";
import { PUBLIC_YT_CHANNEL } from "astro:env/client";

export const getStreamId = defineAction({
  async handler() {
    const $ = await cheerio.fromURL(
      `https://youtube.com/embed/live_stream?channel=${PUBLIC_YT_CHANNEL}`
    );

    const canonical = $('[rel="canonical"]').first().attr("href");
    if (!canonical) return null;
    const videoURL = new URL(canonical);
    return videoURL.searchParams.get("v");
  },
});
