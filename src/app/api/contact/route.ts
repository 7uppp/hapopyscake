import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env";
import { sendContactInquiryEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 6 * 1024 * 1024;
const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(254),
  phone: z.string().max(60),
  message: z.string().min(2).max(2000),
});

export async function POST(request: Request) {
  if (!env.hasResend) {
    return NextResponse.json(
      { error: "Email delivery is not configured yet." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const message = String(formData.get("message") ?? "");
  const attachment = formData.get("attachment");
  const parsed = contactSchema.safeParse({ name, email, phone, message });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please complete the required fields." },
      { status: 400 },
    );
  }

  let attachmentPayload:
    | {
        filename: string;
        content: string;
      }
    | undefined;

  if (attachment instanceof File && attachment.size > 0) {
    if (!allowedTypes.includes(attachment.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WEBP attachments are supported." },
        { status: 400 },
      );
    }

    if (attachment.size > maxFileSize) {
      return NextResponse.json(
        { error: "Please keep attachments under 6MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await attachment.arrayBuffer());
    attachmentPayload = {
      filename: attachment.name,
      content: buffer.toString("base64"),
    };
  }

  if (env.hasDatabase) {
    await prisma.contactInquiry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        message: parsed.data.message,
        attachmentName: attachmentPayload?.filename,
      },
    });
  }

  await sendContactInquiryEmail({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone,
    message: parsed.data.message,
    attachment: attachmentPayload,
  });

  return NextResponse.json({ ok: true });
}
