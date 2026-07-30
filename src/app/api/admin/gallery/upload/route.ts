import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { createSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 5 * 1024 * 1024;

function hasAllowedImageSignature(buffer: ArrayBuffer, mimeType: string) {
  const bytes = new Uint8Array(buffer.slice(0, 12));

  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  if (mimeType === "image/webp") {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }

  return false;
}

export async function POST(request: Request) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!env.hasDatabase || !env.hasSupabase) {
    return NextResponse.json(
      { error: "Gallery storage is not configured." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const title = String(formData.get("title") ?? "");
  const alt = String(formData.get("alt") ?? "");
  const category = String(formData.get("category") ?? "");
  const caption = String(formData.get("caption") ?? "");

  if (!(file instanceof File) || !title || !alt || !category) {
    return NextResponse.json({ error: "Missing gallery fields." }, { status: 400 });
  }

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, and WEBP images are supported." },
      { status: 400 },
    );
  }

  if (file.size > maxFileSize) {
    return NextResponse.json(
      { error: "Please keep gallery uploads under 5MB." },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();

  if (!hasAllowedImageSignature(arrayBuffer, file.type)) {
    return NextResponse.json({ error: "Invalid image file." }, { status: 400 });
  }

  const path = `${Date.now()}-${slugify(file.name)}`;
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.storage
    .from(env.galleryBucket)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const item = await prisma.galleryItem.create({
    data: {
      title,
      alt,
      caption,
      category,
      storagePath: path,
    },
  });

  return NextResponse.json({ item });
}
