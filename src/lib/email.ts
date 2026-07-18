import { Resend } from "resend";

import { env, assertServerEnv } from "@/lib/env";
import type { OrderPayload } from "@/lib/products";
import { buildOrderSummary, calculateOrderAmount } from "@/lib/products";
import { createUnsubscribeToken } from "@/lib/security";
import { formatCurrency } from "@/lib/utils";

function getResend() {
  assertServerEnv(env.hasResend, "Resend is not configured.");
  return new Resend(process.env.RESEND_API_KEY!);
}

function renderSummaryRows(payload: OrderPayload) {
  return buildOrderSummary(payload.selection)
    .map(
      (item) =>
        `<tr><td style="padding:6px 12px 6px 0;font-weight:600;">${item.label}</td><td style="padding:6px 0;">${item.value}</td></tr>`,
    )
    .join("");
}

export async function sendOrderConfirmationEmail(options: {
  payload: OrderPayload;
}) {
  const resend = getResend();
  const amount = formatCurrency(calculateOrderAmount(options.payload.selection));

  return resend.emails.send({
    from: process.env.MARKETING_FROM_EMAIL!,
    to: options.payload.email,
    subject: `Your ${env.siteUrl.includes("localhost") ? "sample" : ""} Happy's Cake order is confirmed`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2e241d;">
        <h1 style="margin-bottom:8px;">Thanks for your order, ${options.payload.customerName}.</h1>
        <p>We have received your payment and your pickup request is now in our baking queue.</p>
        <table style="margin:16px 0;border-collapse:collapse;">${renderSummaryRows(options.payload)}</table>
        <p><strong>Pickup request:</strong> ${options.payload.pickupDate}</p>
        <p><strong>Pickup address:</strong> 18 Park Close, Hillcrest QLD 4118</p>
        <p><strong>Pickup contact:</strong> 0472707510</p>
        <p><strong>Total paid:</strong> ${amount}</p>
        <p>Please arrive on time for pickup and avoid arriving early. Please text or call us around 20 minutes before you arrive.</p>
        <p>We cannot accept any order changes within 3 days of your pickup time.</p>
        <p>Please reply to this email if you need to update colours, reference details, or allergy notes before that cutoff.</p>
      </div>
    `,
  });
}

export async function sendOrderNotificationEmail(options: {
  payload: OrderPayload;
  orderId: string;
  imageUrls: string[];
}) {
  const resend = getResend();

  return resend.emails.send({
    from: process.env.MARKETING_FROM_EMAIL!,
    to: process.env.ORDER_NOTIFICATION_EMAIL!,
    subject: `New paid order · ${options.orderId}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2e241d;">
        <h1 style="margin-bottom:8px;">New paid order received</h1>
        <p><strong>Order ID:</strong> ${options.orderId}</p>
        <p><strong>Customer:</strong> ${options.payload.customerName}</p>
        <p><strong>Email:</strong> ${options.payload.email}</p>
        <p><strong>Phone:</strong> ${options.payload.phone}</p>
        <table style="margin:16px 0;border-collapse:collapse;">${renderSummaryRows(options.payload)}</table>
        <p><strong>Pickup request:</strong> ${options.payload.pickupDate}</p>
        <p><strong>Special notes:</strong> ${options.payload.notes || "None"}</p>
        ${
          options.imageUrls.length > 0
            ? `<p><strong>Reference images:</strong></p><ul>${options.imageUrls
                .map((url) => `<li><a href="${url}">${url}</a></li>`)
                .join("")}</ul>`
            : "<p><strong>Reference images:</strong> None</p>"
        }
      </div>
    `,
  });
}

export async function sendContactInquiryEmail(options: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  attachment?: {
    filename: string;
    content: string;
  };
}) {
  const resend = getResend();

  return resend.emails.send({
    from: process.env.MARKETING_FROM_EMAIL!,
    to: process.env.ORDER_NOTIFICATION_EMAIL!,
    subject: `New contact enquiry from ${options.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2e241d;">
        <h1>New enquiry</h1>
        <p><strong>Name:</strong> ${options.name}</p>
        <p><strong>Email:</strong> ${options.email}</p>
        <p><strong>Phone:</strong> ${options.phone || "Not provided"}</p>
        <p><strong>Message:</strong></p>
        <p>${options.message.replace(/\n/g, "<br />")}</p>
      </div>
    `,
    attachments: options.attachment
      ? [
          {
            filename: options.attachment.filename,
            content: options.attachment.content,
          },
        ]
      : undefined,
  });
}

export async function sendMarketingEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResend();
  const token = createUnsubscribeToken(options.to);
  const unsubscribeUrl = `${env.siteUrl}/unsubscribe?email=${encodeURIComponent(
    options.to,
  )}&token=${token}`;

  return resend.emails.send({
    from: process.env.MARKETING_FROM_EMAIL!,
    to: options.to,
    subject: options.subject,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2e241d;">
        ${options.html}
        <hr style="margin:24px 0;border:none;border-top:1px solid #eadfd7;" />
        <p style="font-size:12px;color:#7b6d63;">
          You are receiving this email because you opted into updates from Happy's Cake.
          <a href="${unsubscribeUrl}">Unsubscribe here</a>.
        </p>
      </div>
    `,
  });
}
