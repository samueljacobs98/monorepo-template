import { DateTime } from "luxon";
import { err, ok } from "@repo/result";
import { DatetimeFormat, formatDatetime } from "./format";

describe("formatDatetime", () => {
  const validIso = "2021-01-12T00:00:00Z";
  const validIsoWithTime = "2021-03-10T14:30:00Z";

  it("formats Date as dd LLL yyyy", () => {
    expect(formatDatetime(validIso, DatetimeFormat.Date)).toEqual(
      ok("12 Jan 2021")
    );
  });

  it("formats DateWeekday as ccc, d LLL", () => {
    expect(
      formatDatetime(validIsoWithTime, DatetimeFormat.DateWeekday)
    ).toEqual(ok("Wed, 10 Mar"));
  });

  it("formats DateShort as MM/dd/yyyy", () => {
    expect(formatDatetime(validIso, DatetimeFormat.DateShort)).toEqual(
      ok("01/12/2021")
    );
  });

  it("formats Time with 12h am/pm", () => {
    expect(formatDatetime(validIsoWithTime, DatetimeFormat.Time)).toEqual(
      ok("2:30 PM")
    );
  });

  it("formats Time24 with 24h", () => {
    expect(formatDatetime(validIsoWithTime, DatetimeFormat.Time24)).toEqual(
      ok("14:30")
    );
  });

  it("formats DateTime", () => {
    expect(formatDatetime(validIso, DatetimeFormat.DateTime)).toEqual(
      ok("12 Jan 2021, 12:00 AM")
    );
  });

  it("formats DateTimeShort", () => {
    expect(formatDatetime(validIso, DatetimeFormat.DateTimeShort)).toEqual(
      ok("1/12/21 12:00 AM")
    );
  });

  it("formats a Luxon DateTime directly", () => {
    const dt = DateTime.fromISO(validIsoWithTime);

    expect(formatDatetime(dt, DatetimeFormat.DateTime)).toEqual(
      ok("10 Mar 2021, 2:30 PM")
    );
    expect(formatDatetime(dt, DatetimeFormat.DateWeekday)).toEqual(
      ok("Wed, 10 Mar")
    );
  });

  it("formats Iso as full ISO string", () => {
    const result = formatDatetime(validIso, DatetimeFormat.Iso);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("2021-01-12");
      expect(result.value).toContain("00:00:00");
    }
  });

  it("formats Relative for past dates", () => {
    const past = "2020-01-01T00:00:00Z";
    const result = formatDatetime(past, DatetimeFormat.Relative);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeTruthy();
      expect(typeof result.value).toBe("string");
    }
  });

  it("returns err for invalid datetime", () => {
    expect(formatDatetime("not-a-date", DatetimeFormat.Date)).toEqual(
      err(undefined)
    );
    expect(formatDatetime("", DatetimeFormat.Date)).toEqual(err(undefined));
    expect(formatDatetime("2021-13-45", DatetimeFormat.Date)).toEqual(
      err(undefined)
    );
    expect(
      formatDatetime(DateTime.fromISO("not-a-date"), DatetimeFormat.Date)
    ).toEqual(err(undefined));
  });

  it("respects locale option", () => {
    expect(
      formatDatetime(validIso, DatetimeFormat.Date, { locale: "fr" })
    ).toEqual(ok("12 janv. 2021"));
  });
});
