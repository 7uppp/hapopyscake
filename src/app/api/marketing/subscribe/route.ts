import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const subscribeSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  if (!env.hasDatabase) {
    return NextResponse.json(
      { error: "Database is not configured yet." },
      { status: 503 },
    );
  }

  const body = await request.json();
  const parsed = subscribeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const session = await auth();

  const linkedUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  const existingConsent = await prisma.marketingConsent.findFirst({
    where: { email },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  if (existingConsent) {
    await prisma.marketingConsent.update({
      where: { id: existingConsent.id },
      data: {
        userId: session?.user?.id ?? linkedUser?.id ?? null,
        subscribed: true,
        source: "popup",
        consentedAt: new Date(),
        unsubscribedAt: null,
      },
    });
  } else {
    await prisma.marketingConsent.create({
      data: {
        userId: session?.user?.id ?? linkedUser?.id ?? null,
        email,
        subscribed: true,
        source: "popup",
        consentedAt: new Date(),
        unsubscribedAt: null,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
