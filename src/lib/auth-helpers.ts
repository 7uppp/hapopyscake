import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { env } from "@/lib/env";

export async function requireSession() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();
  const email = session.user.email?.toLowerCase() ?? "";

  if (session.user.role !== "ADMIN" && !env.adminEmails.includes(email)) {
    redirect("/account");
  }

  return session;
}

export function isAdminEmail(email: string) {
  return env.adminEmails.includes(email.toLowerCase());
}
