#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "design-system", "manifest.json");
const activePath = path.join(root, "design-system", "active-bucket.json");

const input = process.argv.slice(2).join(" ").trim().toLowerCase();
if (!input) {
  console.log("Usage: node scripts/outfit-manager.mjs \"list outfits\" | \"switch to next one\" | \"switch to previous one\" | \"switch to idea-03\"");
  process.exit(1);
}

const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const buckets = manifest.buckets ?? [];
const order = buckets.map((bucket) => bucket.id);

if (order.length === 0) {
  console.error("No outfits found in design-system/manifest.json");
  process.exit(1);
}

async function readActive() {
  try {
    const parsed = JSON.parse(await fs.readFile(activePath, "utf8"));
    if (parsed.activeBucketId && order.includes(parsed.activeBucketId)) {
      return parsed.activeBucketId;
    }
  } catch {
    // no-op
  }
  return order[0];
}

async function writeActive(activeBucketId) {
  await fs.writeFile(activePath, `${JSON.stringify({ activeBucketId }, null, 2)}\n`, "utf8");
}

function printOutfits(activeId) {
  for (const bucket of buckets) {
    const marker = bucket.id === activeId ? "*" : " ";
    console.log(`${marker} ${bucket.id} - ${bucket.name} (${bucket.style_family})`);
  }
}

const active = await readActive();

if (input === "list outfits") {
  printOutfits(active);
  process.exit(0);
}

let nextId = active;

if (input === "switch to next one") {
  const index = order.indexOf(active);
  nextId = order[(index + 1) % order.length];
} else if (input === "switch to previous one") {
  const index = order.indexOf(active);
  nextId = order[(index - 1 + order.length) % order.length];
} else {
  const match = input.match(/^switch to (idea-\d{2})$/);
  if (!match) {
    console.error(`Unsupported command: ${input}`);
    process.exit(1);
  }
  const requested = match[1];
  if (!order.includes(requested)) {
    console.error(`Outfit not found: ${requested}`);
    process.exit(1);
  }
  nextId = requested;
}

await writeActive(nextId);

const bucket = buckets.find((entry) => entry.id === nextId);
console.log(`Active outfit set to ${nextId}${bucket ? ` - ${bucket.name}` : ""}`);
