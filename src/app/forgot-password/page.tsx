import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Forgot Password",
  description: "Request a secure Happy's Cake password reset link.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <div className="container-shell max-w-5xl py-16">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
            Password help
          </p>
          <h1 className="section-title max-w-xl text-[clamp(2.8rem,4.2vw,4.4rem)] leading-[1.02] text-[var(--color-ink)]">
            Reset your Happy&apos;s Cake password
          </h1>
          <p className="text-lg leading-8 text-[var(--color-cocoa)]">
            Enter the email you used to create your account. If it exists, we’ll
            send a secure reset link to that inbox.
          </p>
          <p className="text-sm text-[var(--color-cocoa)]">
            Remembered it?{" "}
            <Link href="/login" className="font-bold text-[var(--color-berry)]">
              Back to login
            </Link>
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
