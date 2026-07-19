import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { slugify } from "@/lib/utils";
import { createSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 2 * 1024 * 1024;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  if (!env.hasSupabase) {
    return NextResponse.json(
      { error: "Supabase storage is not configured yet." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const draftId = String(formData.get("draftId") ?? "");

  if (!(file instanceof File) || !draftId) {
    return NextResponse.json({ error: "Missing file upload." }, { status: 400 });
  }

  if (!uuidPattern.test(draftId)) {
    return NextResponse.json({ error: "Invalid upload session." }, { status: 400 });
  }

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, and WEBP images are supported." },
      { status: 400 },
    );
  }

  if (file.size > maxFileSize) {
    return NextResponse.json(
      { error: "Please keep uploads under 2MB." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const arrayBuffer = await file.arrayBuffer();

  if (!hasAllowedImageSignature(arrayBuffer, file.type)) {
    return NextResponse.json({ error: "Invalid image file." }, { status: 400 });
  }

  const path = `${draftId}/${Date.now()}-${slugify(file.name)}`;

  const { error } = await supabase.storage
    .from(env.orderBucket)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    file: {
      path,
      originalName: file.name,
      mimeType: file.type,
    },
  });
}
