import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/auth-helpers";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

const schema = z.object({
  id: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.email || (!isAdminEmail(session.user.email) && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!env.hasDatabase || !env.hasSupabase) {
    return NextResponse.json(
      { error: "Gallery storage is not configured." },
      { status: 503 },
    );
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Missing gallery id." }, { status: 400 });
  }

  const item = await prisma.galleryItem.findUnique({
    where: { id: parsed.data.id },
  });

  if (!item) {
    return NextResponse.json({ error: "Gallery item not found." }, { status: 404 });
  }

  const supabase = createSupabaseAdminClient();
  await supabase.storage.from(env.galleryBucket).remove([item.storagePath]);

  await prisma.galleryItem.delete({
    where: { id: item.id },
  });

  return NextResponse.json({ ok: true });
}
