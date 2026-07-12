import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminEmail } from "@/lib/auth-helpers";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  marketingOptIn: z.boolean().default(false),
});

export async function POST(request: Request) {
  if (!env.hasDatabase) {
    return NextResponse.json(
      { error: "Database is not configured yet." },
      { status: 503 },
    );
  }

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your form fields." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: isAdminEmail(email) ? "ADMIN" : "USER",
    },
  });

  await prisma.marketingConsent.create({
    data: {
      userId: user.id,
      email,
      subscribed: parsed.data.marketingOptIn,
      source: "register",
      consentedAt: parsed.data.marketingOptIn ? new Date() : null,
      unsubscribedAt: parsed.data.marketingOptIn ? null : new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
