import { createClient } from "@supabase/supabase-js";

const client = createClient(
  `https://${import.meta.env.PUBLIC_SB_PROJECT_ID}.supabase.co`,
  import.meta.env.SB_DB_SR_KEY
);

export default client;
