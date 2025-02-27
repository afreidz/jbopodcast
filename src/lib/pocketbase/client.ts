import PocketBase from "pocketbase";
import { PUBLIC_PB_ENDPOINT } from "astro:env/client";
import type { TypedPocketBase } from "@pocketbase/types";

const pb = new PocketBase(PUBLIC_PB_ENDPOINT) as TypedPocketBase;
export default pb;
