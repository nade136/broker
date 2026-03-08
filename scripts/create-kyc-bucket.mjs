#!/usr/bin/env node
/**
 * One-time setup: create the Supabase Storage bucket "kyc-documents" for KYC uploads.
 * Run: node --env-file=.env.local scripts/create-kyc-bucket.mjs
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
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "kyc-documents";

async function main() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) {
    console.log(`Bucket "${BUCKET}" already exists.`);
    return;
  }
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (error) {
    console.error("Failed to create bucket:", error.message);
    process.exit(1);
  }
  console.log(`Bucket "${BUCKET}" created. Run supabase/storage-policy-kyc-documents.sql in SQL Editor.`);
}

main();
