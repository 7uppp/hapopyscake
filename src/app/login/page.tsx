import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="container-shell max-w-5xl py-16">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
            Welcome back
          </p>
          <h1 className="section-title text-5xl text-[var(--color-ink)]">
            Log in to see your orders and marketing preferences
          </h1>
          <p className="text-lg leading-8 text-[var(--color-cocoa)]">
            Use your email and password to access your account, order history,
            and marketing preferences.
          </p>
          <p className="text-sm text-[var(--color-cocoa)]">
            New here?{" "}
            <Link href="/register" className="font-bold text-[var(--color-berry)]">
              Create an account
            </Link>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
