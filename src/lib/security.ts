import crypto from "node:crypto";

import { env } from "@/lib/env";

export function createUnsubscribeToken(email: string) {
  return crypto
    .createHmac("sha256", env.authSecret)
    .update(email.toLowerCase())
    .digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string) {
  const expected = createUnsubscribeToken(email);
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(token.padEnd(expected.length, "0").slice(0, expected.length)),
  );
}
