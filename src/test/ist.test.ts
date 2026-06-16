import { afterEach, describe, expect, it, vi } from "vitest";

import { isTodaySundayIST } from "@/lib/ist";

describe("IST Sunday detection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is active on Sunday in IST", () => {
    vi.spyOn(Date, "now").mockReturnValue(Date.UTC(2026, 5, 14, 0, 0, 0));

    expect(isTodaySundayIST()).toBe(true);
  });

  it("is not active on Monday in IST", () => {
    vi.spyOn(Date, "now").mockReturnValue(Date.UTC(2026, 5, 14, 18, 30, 0));

    expect(isTodaySundayIST()).toBe(false);
  });
});
