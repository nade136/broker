#!/usr/bin/env node
/**
 * One-time setup: create the Supabase Storage bucket "deposit-screenshots" so
 * users can upload payment screenshots and the admin sees them in Notifications.
 *
 * Run from project root:
 *   node --env-file=.env.local scripts/create-deposit-bucket.mjs
 * Or (if Node < 20.6): set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then node scripts/create-deposit-bucket.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  content.split("\n").forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  });
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Use .env.local or set them.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "deposit-screenshots";

async function main() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) {
    console.log(`Bucket "${BUCKET}" already exists.`);
    return;
  }
  const { data, error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
  });
  if (error) {
    console.error("Failed to create bucket:", error.message);
    process.exit(1);
  }
  console.log(`Bucket "${BUCKET}" created. Users can upload; admin can open screenshot links in Notifications.`);
  console.log("In Supabase Dashboard → Storage → deposit-screenshots → Policies, add:");
  console.log('  - "Allow authenticated uploads": INSERT for authenticated users, path prefix ""');
}

main();
