import { promises as fs } from "node:fs";
import path from "node:path";

type BucketManifestEntry = {
  id: string;
  name: string;
  style_family: string;
};

type Manifest = {
  buckets: BucketManifestEntry[];
};

type ActiveBucketFile = {
  activeBucketId: string;
};

const designSystemDir = path.join(process.cwd(), "design-system");
const manifestPath = path.join(designSystemDir, "manifest.json");
const activeBucketPath = path.join(designSystemDir, "active-bucket.json");

async function readManifest(): Promise<Manifest> {
  const raw = await fs.readFile(manifestPath, "utf8");
  return JSON.parse(raw) as Manifest;
}

export async function getBucketOrder(): Promise<string[]> {
  const manifest = await readManifest();
  return manifest.buckets.map((bucket) => bucket.id);
}

export async function readActiveBucket(): Promise<string> {
  const buckets = await getBucketOrder();
  const fallback = buckets[0] ?? "idea-01";

  try {
    const raw = await fs.readFile(activeBucketPath, "utf8");
    const parsed = JSON.parse(raw) as ActiveBucketFile;

    if (parsed.activeBucketId && buckets.includes(parsed.activeBucketId)) {
      return parsed.activeBucketId;
    }
  } catch {
    // Fall through to fallback.
  }

  await fs.writeFile(activeBucketPath, JSON.stringify({ activeBucketId: fallback }, null, 2) + "\n", "utf8");
  return fallback;
}

export async function getActiveThemeClass(): Promise<string> {
  const activeBucketId = await readActiveBucket();
  return `theme-${activeBucketId}`;
}
