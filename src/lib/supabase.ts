import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SB_ANON_KEY, PUBLIC_SB_PROJECT_URL } from "astro:env/client";

const client = createClient(PUBLIC_SB_PROJECT_URL, PUBLIC_SB_ANON_KEY);

export default client;
