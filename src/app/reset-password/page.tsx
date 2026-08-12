import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Reset Password",
  description: "Choose a new password for your Happy's Cake account.",
  path: "/reset-password",
  noIndex: true,
});

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const email = getSearchParamValue(params.email);
  const token = getSearchParamValue(params.token);

  return (
    <div className="container-shell max-w-5xl py-16">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
            New password
          </p>
          <h1 className="section-title max-w-xl text-[clamp(2.8rem,4.2vw,4.4rem)] leading-[1.02] text-[var(--color-ink)]">
            Choose a fresh password
          </h1>
          <p className="text-lg leading-8 text-[var(--color-cocoa)]">
            Your reset link is valid for 1 hour. Once updated, you can log in
            with your new password immediately.
          </p>
          <p className="text-sm text-[var(--color-cocoa)]">
            Need a new link?{" "}
            <Link
              href="/forgot-password"
              className="font-bold text-[var(--color-berry)]"
            >
              Request another reset
            </Link>
          </p>
        </div>
        <ResetPasswordForm email={email} token={token} />
      </div>
    </div>
  );
}
