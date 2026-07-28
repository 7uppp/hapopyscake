/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const uploadMock = vi.fn();

vi.mock("@/lib/supabase", () => ({
  createSupabaseAdminClient: () => ({
    storage: {
      from: vi.fn(() => ({
        upload: uploadMock,
      })),
    },
  }),
}));

function makePngFile(name = "pet face.png", sizePadding = 0) {
  const pngSignature = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00,
  ]);
  const content = new Uint8Array(pngSignature.length + sizePadding);
  content.set(pngSignature);

  return new File([content], name, { type: "image/png" });
}

async function postUpload(file: File, draftId = "123e4567-e89b-42d3-a456-426614174000") {
  const { POST } = await import("@/app/api/uploads/order-reference/route");
  const formData = new FormData();

  formData.set("file", file);
  formData.set("draftId", draftId);

  return POST(new Request("http://localhost/api/uploads/order-reference", {
    method: "POST",
    body: formData,
  }));
}

describe("order reference upload route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
    uploadMock.mockReset();
    uploadMock.mockResolvedValue({ error: null });
  });

  it("accepts valid image uploads and stores them in the private order bucket", async () => {
    const response = await postUpload(makePngFile("My Pet!!.png"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.file.mimeType).toBe("image/png");
    expect(body.file.originalName).toBe("My Pet!!.png");
    expect(body.file.path).toMatch(
      /^123e4567-e89b-42d3-a456-426614174000\/\d+-my-pet-png$/,
    );
    expect(uploadMock).toHaveBeenCalledWith(
      body.file.path,
      expect.any(ArrayBuffer),
      expect.objectContaining({ contentType: "image/png", upsert: false }),
    );
  });

  it("rejects invalid upload sessions", async () => {
    const response = await postUpload(makePngFile(), "not-a-uuid");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid upload session.",
    });
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("rejects unsupported MIME types", async () => {
    const response = await postUpload(
      new File(["hello"], "pet.txt", { type: "text/plain" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Only JPG, PNG, and WEBP images are supported.",
    });
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("rejects files larger than 2MB", async () => {
    const response = await postUpload(makePngFile("large.png", 2 * 1024 * 1024));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Please keep uploads under 2MB.",
    });
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("rejects files with mismatched MIME signatures", async () => {
    const response = await postUpload(
      new File(["not a png"], "fake.png", { type: "image/png" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid image file.",
    });
    expect(uploadMock).not.toHaveBeenCalled();
  });
});
