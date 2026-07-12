import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").toLowerCase();
  const token = String(formData.get("token") ?? "");

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return NextResponse.redirect(new URL("/unsubscribe", request.url), 303);
  }

  if (env.hasDatabase) {
    await prisma.marketingConsent.updateMany({
      where: { email },
      data: {
        subscribed: false,
        unsubscribedAt: new Date(),
      },
    });
  }

  return NextResponse.redirect(
    new URL(`/unsubscribe?email=${encodeURIComponent(email)}&done=1`, request.url),
    303,
  );
}
