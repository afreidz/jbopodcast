import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SB_PROJECT_ID, SB_DB_SR_KEY } from "astro:env/server";

console.log("ANDY", PUBLIC_SB_PROJECT_ID, SB_DB_SR_KEY);

const client = createClient(
  `https://${PUBLIC_SB_PROJECT_ID}.supabase.co`,
  SB_DB_SR_KEY
);

export default client;
