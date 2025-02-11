import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SB_ANON_KEY, PUBLIC_SB_PROJECT_ID } from "astro:env/client";
// import { SB_DB_SR_KEY } from "astro:env/server";

const client = createClient(
  `https://${PUBLIC_SB_PROJECT_ID}.supabase.co`,
  PUBLIC_SB_ANON_KEY
);

export default client;
