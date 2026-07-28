/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const sendMarketingEmailMock = vi.fn();
const prismaMock = {
  marketingConsent: { findMany: vi.fn() },
  campaign: { create: vi.fn(), update: vi.fn() },
  campaignRecipientLog: { createMany: vi.fn() },
};

async function setupMarketingRoute() {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", "postgresql://test");
  vi.stubEnv("RESEND_API_KEY", "re_test_123");

  vi.doMock("@/auth", () => ({ auth: authMock }));
  vi.doMock("@/lib/email", () => ({ sendMarketingEmail: sendMarketingEmailMock }));
  vi.doMock("@/lib/prisma", () => ({ prisma: prismaMock }));

  return import("@/app/api/marketing/send/route");
}

async function postCampaign() {
  const { POST } = await setupMarketingRoute();

  return POST(
    new Request("http://localhost/api/marketing/send", {
      method: "POST",
      body: JSON.stringify({
        subject: "Cake news",
        html: "<p>Fresh cake updates</p>",
      }),
    }),
  );
}

describe("admin-only marketing route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated users before touching dependencies", async () => {
    authMock.mockResolvedValue(null);

    const response = await postCampaign();

    expect(response.status).toBe(401);
    expect(prismaMock.marketingConsent.findMany).not.toHaveBeenCalled();
    expect(sendMarketingEmailMock).not.toHaveBeenCalled();
  });

  it("rejects non-admin users", async () => {
    authMock.mockResolvedValue({
      user: { id: "user_123", role: "USER" },
    });

    const response = await postCampaign();

    expect(response.status).toBe(401);
    expect(prismaMock.marketingConsent.findMany).not.toHaveBeenCalled();
  });
});
