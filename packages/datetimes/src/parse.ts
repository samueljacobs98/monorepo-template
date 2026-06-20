import { DateTime as LuxonDateTime } from "luxon";
import { err, ok, Result } from "@repo/result";
import type { DateTime } from "./types";

type Options = Parameters<typeof LuxonDateTime.fromISO>[1];

/**
 * Parse an ISO 8601 datetime string into a Luxon DateTime.
 *
 * @param datetime - ISO 8601 datetime string (e.g. "2021-01-12T00:00:00Z")
 * @returns Ok with a valid DateTime, or Err if the input is invalid
 */
export function parseDatetime(
  datetime: string,
  options?: Options
): Result<DateTime, undefined> {
  const dt = LuxonDateTime.fromISO(datetime, options);
  return dt.isValid ? ok(dt) : err(undefined);
}
