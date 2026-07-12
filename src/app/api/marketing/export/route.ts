import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/auth-helpers";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email || (!isAdminEmail(session.user.email) && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!env.hasDatabase) {
    return NextResponse.json(
      { error: "Database is not configured yet." },
      { status: 503 },
    );
  }

  const consents = await prisma.marketingConsent.findMany({
    where: { subscribed: true },
    orderBy: { updatedAt: "desc" },
  });

  const seen = new Set<string>();
  const rows = consents
    .filter((item) => {
      if (seen.has(item.email)) {
        return false;
      }

      seen.add(item.email);
      return true;
    })
    .map(
      (item) =>
        `"${item.email}","${item.source}","${item.consentedAt?.toISOString() ?? ""}"`,
    );

  const csv = ["email,source,consented_at", ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
    },
  });
}
