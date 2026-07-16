# Happy's Cake

A cute pet cake ordering site built with `Next.js 16`, `Tailwind CSS 4`, `next-auth`, `Stripe`, `Resend`, `Supabase Storage`, and `Prisma` for PostgreSQL.

## Included features

- Product-driven order builder for:
  - `3D Head Cupcake`
  - `3D Head Cake`
  - `3D Full Body Cake`
  - `Themed Cookie`
- Guest checkout and account-based ordering
- Email/password account registration and login
- Stripe checkout session creation and webhook handling
- Buyer confirmation email and merchant order notification email
- Public gallery page
- Contact form with optional image attachment sent by email
- Marketing subscriber storage, export, unsubscribe, and simple admin campaign sender
- Supabase storage split between:
  - public gallery assets
  - private order reference uploads

## Tech stack

- `Next.js App Router`
- `React 19`
- `Tailwind CSS 4`
- `Prisma 7`
- `PostgreSQL`
- `next-auth v4`
- `Stripe`
- `Resend`
- `Supabase Storage`

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy envs:

```bash
copy .env.example .env.local
```

3. Fill in these values:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `ORDER_NOTIFICATION_EMAIL`
- `MARKETING_FROM_EMAIL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_GALLERY_BUCKET`
- `SUPABASE_ORDER_BUCKET`
- `ADMIN_EMAILS`

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Run the app:

```bash
npm run dev
```

## Database notes

- The Prisma schema is in `prisma/schema.prisma`.
- Prisma 7 config is in `prisma.config.ts`.
- This project expects PostgreSQL, which fits Supabase Postgres.

## Storage notes

- `gallery-public` bucket is intended for public gallery images.
- `order-reference-private` bucket is intended for customer-uploaded reference photos.
- Contact form attachments are emailed directly and are not persisted to storage.

## Validation

The current workspace passes:

- `npm run lint`
- `npm run build`
