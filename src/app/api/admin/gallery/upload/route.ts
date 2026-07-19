import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { createSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

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

  const path = `${Date.now()}-${slugify(file.name)}`;
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.storage
    .from(env.galleryBucket)
    .upload(path, await file.arrayBuffer(), {
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
