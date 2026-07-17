import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const envFiles = [".env", ".env.local"];

async function loadEnvFiles() {
  for (const fileName of envFiles) {
    const filePath = path.join(root, fileName);

    try {
      const content = await fs.readFile(filePath, "utf8");

      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
          continue;
        }

        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");

        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    } catch {
      // Missing env files are fine for CI/Vercel environments.
    }
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getContentType(fileName) {
  const extension = path.extname(fileName).toLowerCase();

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  return "image/jpeg";
}

await loadEnvFiles();

const databaseUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const galleryBucket = process.env.SUPABASE_GALLERY_BUCKET ?? "gallery-public";

if (!databaseUrl || !supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY.",
  );
}

const folderPath = path.join(root, "public", "Happy paws");
const files = (await fs.readdir(folderPath))
  .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
  .sort((first, second) => first.localeCompare(second, undefined, { numeric: true }));

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

try {
  const { error: bucketLookupError } = await supabase.storage.getBucket(galleryBucket);

  if (bucketLookupError) {
    const { error: bucketCreateError } = await supabase.storage.createBucket(
      galleryBucket,
      {
        public: true,
      },
    );

    if (bucketCreateError) {
      throw new Error(`Could not create ${galleryBucket}: ${bucketCreateError.message}`);
    }

    console.log(`Created public bucket ${galleryBucket}`);
  }

  for (const [index, file] of files.entries()) {
    const storagePath = `happy-paws/${String(index + 1).padStart(3, "0")}-${slugify(file)}`;
    const existing = await prisma.galleryItem.findFirst({
      where: { storagePath },
      select: { id: true },
    });

    if (existing) {
      console.log(`Skipped existing ${storagePath}`);
      continue;
    }

    const buffer = await fs.readFile(path.join(folderPath, file));
    const { error } = await supabase.storage
      .from(galleryBucket)
      .upload(storagePath, buffer, {
        contentType: getContentType(file),
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed for ${file}: ${error.message}`);
    }

    await prisma.galleryItem.create({
      data: {
        title: `Happy Paws ${index + 1}`,
        alt: `Happy's Cake customer photo ${index + 1}`,
        caption: "",
        category: "Happy Paws",
        storagePath,
        featured: index < 8,
      },
    });

    console.log(`Uploaded ${storagePath}`);
  }

  console.log(`Done. Uploaded customer gallery photos to ${galleryBucket}.`);
} finally {
  await prisma.$disconnect();
}
