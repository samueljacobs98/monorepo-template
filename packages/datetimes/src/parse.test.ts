import { parseDatetime } from "./parse";

describe("parseDatetime", () => {
  it("parses valid ISO string to DateTime", () => {
    const result = parseDatetime("2021-01-12T00:00:00Z");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.year).toBe(2021);
      expect(result.value.month).toBe(1);
      expect(result.value.day).toBe(12);
    }
  });

  it("returns err for invalid string", () => {
    for (const input of ["not-a-date", ""]) {
      const result = parseDatetime(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeUndefined();
      }
    }
  });

  it("respects zone option", () => {
    const result = parseDatetime("2021-01-12T15:00:00", { zone: "utc" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.zoneName).toBe("UTC");
      expect(result.value.hour).toBe(15);
    }
  });

  it("respects setZone option", () => {
    const result = parseDatetime("2021-01-12T15:00:00-05:00", {
      setZone: true,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.offset).toBe(-300);
      expect(result.value.zoneName).toBe("UTC-5");
    }
  });
});
