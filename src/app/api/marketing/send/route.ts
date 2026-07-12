import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/auth-helpers";
import { env } from "@/lib/env";
import { sendMarketingEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const campaignSchema = z.object({
  subject: z.string().min(3),
  html: z.string().min(10),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.email || (!isAdminEmail(session.user.email) && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!env.hasDatabase || !env.hasResend) {
    return NextResponse.json(
      { error: "Marketing dependencies are not configured." },
      { status: 503 },
    );
  }

  const body = await request.json();
  const parsed = campaignSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Subject and content are required." }, { status: 400 });
  }

  const consents = await prisma.marketingConsent.findMany({
    where: { subscribed: true },
    orderBy: { updatedAt: "desc" },
    select: { email: true, userId: true },
  });

  const recipientMap = new Map<string, string | null>();
  consents.forEach((item) => {
    if (!recipientMap.has(item.email)) {
      recipientMap.set(item.email, item.userId);
    }
  });

  const recipients = Array.from(recipientMap.entries()).map(([email, userId]) => ({
    email,
    userId,
  }));

  const campaign = await prisma.campaign.create({
    data: {
      subject: parsed.data.subject,
      html: parsed.data.html,
      createdById: session.user.id,
      status: "DRAFT",
    },
  });

  const settled = await Promise.allSettled(
    recipients.map(async (recipient) => {
      const result = await sendMarketingEmail({
        to: recipient.email,
        subject: parsed.data.subject,
        html: parsed.data.html,
      });

      return {
        email: recipient.email,
        userId: recipient.userId,
        providerMessageId: "data" in result ? result.data?.id ?? null : null,
      };
    }),
  );

  const logs = settled.map((item, index) => {
    const recipient = recipients[index];

    if (item.status === "fulfilled") {
      return {
        campaignId: campaign.id,
        email: recipient.email,
        userId: recipient.userId,
        status: "SENT",
        providerMessageId: item.value.providerMessageId,
        sentAt: new Date(),
      };
    }

    return {
      campaignId: campaign.id,
      email: recipient.email,
      userId: recipient.userId,
      status: "FAILED",
      error: item.reason instanceof Error ? item.reason.message : "Unknown error",
      sentAt: null,
    };
  });

  await prisma.campaignRecipientLog.createMany({
    data: logs,
  });

  const sentCount = logs.filter((item) => item.status === "SENT").length;

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      recipientCount: recipients.length,
      sentAt: new Date(),
      status:
        sentCount === recipients.length
          ? "SENT"
          : sentCount > 0
            ? "PARTIAL"
            : "FAILED",
    },
  });

  return NextResponse.json({ ok: true, recipients: sentCount });
}
