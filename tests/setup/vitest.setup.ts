import "@testing-library/jest-dom/vitest";

process.env.AUTH_SECRET ??= "test-auth-secret";
process.env.NEXT_PUBLIC_SITE_URL ??= "http://localhost:3000";
