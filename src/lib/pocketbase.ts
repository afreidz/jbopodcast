  import PocketBase from "pocketbase";
  import * as pbf from "@nedpals/pbf";
  import { PUBLIC_PB_ENDPOINT } from "astro:env/client";
  import type { TypedPocketBase } from "@pocketbase/types";

  const pb = new PocketBase(PUBLIC_PB_ENDPOINT) as TypedPocketBase;
  pb.autoCancellation(false);
  export default pb;

  export function queryBuilder(...q: Parameters<typeof pbf["stringify"]>) {
    return pbf.stringify(...q)
  }

  export const query = pbf;
