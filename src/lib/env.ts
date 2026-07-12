const env = {
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
  authSecret: process.env.AUTH_SECRET ?? "development-secret",
  hasDatabase: Boolean(process.env.DATABASE_URL),
  hasResend: Boolean(process.env.RESEND_API_KEY),
  hasSiteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
  hasStripe: Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  ),
  hasStripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
  hasSupabase: Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  ),
  orderBucket: process.env.SUPABASE_ORDER_BUCKET ?? "order-reference-private",
  galleryBucket: process.env.SUPABASE_GALLERY_BUCKET ?? "gallery-public",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export function assertServerEnv(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

export { env };
