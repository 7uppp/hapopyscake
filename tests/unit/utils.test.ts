import { afterEach, describe, expect, it, vi } from "vitest";

import {
  formatBrisbaneDateTimeInput,
  formatBrisbaneDateTimeLocal,
  formatCurrency,
  getMinimumBrisbanePickupDateTime,
  parseBrisbaneDateTime,
} from "@/lib/utils";

afterEach(() => {
  vi.useRealTimers();
});

describe("Brisbane date and currency helpers", () => {
  it("formats AUD prices consistently", () => {
    expect(formatCurrency(49)).toBe("$49.00");
    expect(formatCurrency(146.5)).toBe("$146.50");
  });

  it("uses Australia/Brisbane time for minimum pickup datetime", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-27T01:05:30.000Z"));

    expect(getMinimumBrisbanePickupDateTime()).toBe("2026-08-03T11:05");
  });

  it("parses and formats local Brisbane datetime inputs", () => {
    const parsed = parseBrisbaneDateTime("2026-08-03T11:05");

    expect(parsed?.toISOString()).toBe("2026-08-03T11:05:00.000Z");
    expect(formatBrisbaneDateTimeLocal(new Date("2026-07-27T01:05:00.000Z"))).toBe(
      "2026-07-27T11:05",
    );
    expect(formatBrisbaneDateTimeInput("not-a-date")).toBe("not-a-date");
  });

  it("rejects malformed datetime input", () => {
    expect(parseBrisbaneDateTime("2026/08/03 11:05")).toBeNull();
    expect(parseBrisbaneDateTime("")).toBeNull();
  });
});
