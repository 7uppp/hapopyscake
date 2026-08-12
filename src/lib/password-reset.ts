"use server";

import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";

import { sendPasswordResetEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { normalizeEmail } from "@/lib/identity";
import { prisma } from "@/lib/prisma";

const passwordResetIdentifierPrefix = "password-reset:";
const passwordResetTokenTtlMs = 60 * 60 * 1000;
const passwordResetEmailCooldownMs = 10 * 60 * 1000;

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(20),
  password: z.string().min(8),
});

type PasswordResetActionState = {
  ok: boolean;
  message: string;
};

function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getPasswordResetIdentifier(email: string) {
  return `${passwordResetIdentifierPrefix}${email}`;
}

function getGenericForgotPasswordMessage() {
  return "If an account exists for that email, we’ll send a password reset link shortly.";
}

export async function requestPasswordReset(
  _previousState: PasswordResetActionState,
  formData: FormData,
): Promise<PasswordResetActionState> {
  if (!env.hasDatabase || !env.hasResend || !env.hasSiteUrl) {
    return {
      ok: false,
      message: "Password reset is not configured yet. Please contact us for help.",
    };
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please enter a valid email address.",
    };
  }

  const email = normalizeEmail(parsed.data.email);
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return {
      ok: true,
      message: getGenericForgotPasswordMessage(),
    };
  }

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashPasswordResetToken(rawToken);
  const identifier = getPasswordResetIdentifier(email);
  const expires = new Date(Date.now() + passwordResetTokenTtlMs);
  const existingToken = await prisma.verificationToken.findFirst({
    where: {
      identifier,
      expires: {
        gt: new Date(Date.now() + passwordResetTokenTtlMs - passwordResetEmailCooldownMs),
      },
    },
    select: { token: true },
  });

  if (existingToken) {
    return {
      ok: true,
      message: getGenericForgotPasswordMessage(),
    };
  }

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: tokenHash,
      expires,
    },
  });

  const resetUrl = `${env.siteUrl.replace(/\/$/, "")}/reset-password?email=${encodeURIComponent(
    email,
  )}&token=${encodeURIComponent(rawToken)}`;

  await sendPasswordResetEmail({
    email,
    resetUrl,
  });

  return {
    ok: true,
    message: getGenericForgotPasswordMessage(),
  };
}

export async function resetPassword(
  _previousState: PasswordResetActionState,
  formData: FormData,
): Promise<PasswordResetActionState> {
  if (!env.hasDatabase) {
    return {
      ok: false,
      message: "Password reset is not configured yet. Please contact us for help.",
    };
  }

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password !== confirmPassword) {
    return {
      ok: false,
      message: "Please make sure both passwords match.",
    };
  }

  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
    password,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "This reset link is invalid, or the new password is too short.",
    };
  }

  const email = normalizeEmail(parsed.data.email);
  const identifier = getPasswordResetIdentifier(email);
  const tokenHash = hashPasswordResetToken(parsed.data.token);
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { token: tokenHash },
  });

  if (
    !tokenRecord ||
    tokenRecord.identifier !== identifier ||
    tokenRecord.expires <= new Date()
  ) {
    await prisma.verificationToken.deleteMany({
      where: {
        OR: [{ identifier }, { expires: { lte: new Date() } }],
      },
    });

    return {
      ok: false,
      message: "This reset link has expired or is invalid. Please request a new link.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return {
      ok: false,
      message: "This reset link has expired or is invalid. Please request a new link.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.verificationToken.deleteMany({
      where: { identifier },
    }),
  ]);

  return {
    ok: true,
    message: "Your password has been updated. You can now log in with your new password.",
  };
}
