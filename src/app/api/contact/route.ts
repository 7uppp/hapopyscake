import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { sendContactInquiryEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 6 * 1024 * 1024;

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

  if (!name || !email || !message) {
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
        name,
        email: email.toLowerCase(),
        phone,
        message,
        attachmentName: attachmentPayload?.filename,
      },
    });
  }

  await sendContactInquiryEmail({
    name,
    email,
    phone,
    message,
    attachment: attachmentPayload,
  });

  return NextResponse.json({ ok: true });
}
