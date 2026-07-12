import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { slugify } from "@/lib/utils";
import { createSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 6 * 1024 * 1024;

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

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, and WEBP images are supported." },
      { status: 400 },
    );
  }

  if (file.size > maxFileSize) {
    return NextResponse.json(
      { error: "Please keep uploads under 6MB each." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const arrayBuffer = await file.arrayBuffer();
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
