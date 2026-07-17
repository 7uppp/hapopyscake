import type { Metadata } from "next";

import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Register",
};

type RegisterPageProps = {
  searchParams: Promise<{ email?: string | string[] }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const initialEmail = Array.isArray(params.email)
    ? params.email[0]
    : params.email;

  return (
    <div className="container-shell max-w-5xl py-16">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
            Create your account
          </p>
          <h1 className="section-title text-5xl text-[var(--color-ink)]">
            Save your details now for easier repeat orders later
          </h1>
          <p className="text-lg leading-8 text-[var(--color-cocoa)]">
            Accounts help us keep your previous orders, attach future purchases to
            the same customer profile, and manage marketing consent properly.
          </p>
        </div>
        <RegisterForm initialEmail={initialEmail ?? ""} />
      </div>
    </div>
  );
}
