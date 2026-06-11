import { createClient } from "@supabase/supabase-js";
import { loadEnvFile } from "node:process";

try {
  loadEnvFile(".env");
} catch (e) {
  // Ignore
}

const url = process.env.VITE_SUPABASE_URL || "https://zobqpbdjtwtxsvvmcfle.supabase.co";
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!key) {
  console.error("No VITE_SUPABASE_ANON_KEY found!");
  process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
  const tables = [
    "profiles",
    "community_users",
    "community_groups",
    "community_posts",
    "community_comments",
    "community_reactions",
    "community_saved_posts",
    "community_blocks",
    "community_reports",
    "community_group_members",
    "community_pages",
    "community_page_followers"
  ];

  console.log(`Checking connection to: ${url}`);
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .limit(1);
      if (error) {
        console.log(`❌ Table "${table}": Error ->`, error.message);
      } else {
        console.log(`✅ Table "${table}": exists (data count/checks ok)`);
      }
    } catch (err: any) {
      console.log(`❌ Table "${table}": Exception ->`, err.message);
    }
  }
}

check();
