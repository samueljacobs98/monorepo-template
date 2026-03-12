import { types } from "node:util";
import { err, type Err, ok, type Ok, type Result } from "./result";

/**
 * Check if a Result is Ok.
 * @param result - The Result to check.
 * @returns True if the Result is Ok, false otherwise.
 * @example isOk(result) // boolean
 */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok;

/**
 * Check if a Result is Err.
 * @param result - The Result to check.
 * @returns True if the Result is Err, false otherwise.
 * @example isErr(result) // boolean
 */
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> =>
  !result.ok;

/**
 * Map a Result's success value, leaving error untouched.
 * @param r - The Result to map over.
 * @param fn - The function to map over the Result's success value.
 * @returns A new Result with the mapped value.
 * @example map(result, x => x + 1)
 */
export const map = <T, U, E>(r: Result<T, E>, fn: (t: T) => U): Result<U, E> =>
  r.ok ? ok(fn(r.value)) : r;

/**
 * Map a Result's error value, leaving success untouched.
 * Useful to normalize errors at boundaries.
 * @param r - The Result to map over.
 * @param fn - The function to map over the Result's error value.
 * @returns A new Result with the mapped value.
 * @example mapErr(result, e => e.message) // Result<T, string>
 */
export const mapErr = <T, E, F>(
  r: Result<T, E>,
  fn: (e: E) => F
): Result<T, F> => (r.ok ? r : err(fn(r.error)));

/**
 * Flat-map (bind) across Results.
 * @param r - The Result to flat-map over.
 * @param fn - The function to flat-map over the Result's value.
 * @returns A new Result with the mapped value.
 * @example flatMap(getUser(), user => getLists(user.id))
 * // Result<List[], Error>
 */
export const flatMap = <T, U, E>(
  r: Result<T, E>,
  fn: (t: T) => Result<U, E>
): Result<U, E> => (r.ok ? fn(r.value) : r);

/**
 * Pattern-match a Result into a single value (async aware).
 * Keeps controllers linear and explicit.
 * @param r - The Result to match over.
 * @param arms - The arms to match over the Result.
 * @returns The result of the matched arm.
 * @example match(result, { ok: x => x + 1, err: e => e.message })
 */
export const match = async <T, E, U>(
  r: Result<T, E>,
  arms: { ok: (t: T) => U | Promise<U>; err: (e: E) => U | Promise<U> }
): Promise<U> => (r.ok ? arms.ok(r.value) : arms.err(r.error));

/**
 * Default error mapper that converts unknown errors to Error.
 * @param e - The unknown error to map.
 * @returns The mapped error.
 */
const defaultErrorMapper = (e: unknown): Error =>
  e instanceof Error ? e : new Error(String(e));

/**
 * Wrap a potentially-throwing sync or async function into a Result.
 * - Sync fn: returns Result<T, E>
 * - Async fn: returns Promise<Result<T, E>>
 *
 * @param fn - The function to wrap.
 * @param errorMapper - The function to map errors to an error type.
 * @returns A new Result with the mapped value.
 * @example const result = pluck(() => db.getUser(1), e => new Error(e.message))
 * // result is Result<User, Error>
 * @example const result = await pluck(async () => await db.getUser(1), e => new Error(e.message))
 * // result is Promise<Result<User, Error>>
 */
export function pluck<T, E>(
  fn: () => T,
  errorMapper: (e: unknown) => E
): T extends Promise<infer R> ? Promise<Result<R, E>> : Result<T, E>;
export function pluck<T>(
  fn: () => T
): T extends Promise<infer R> ? Promise<Result<R, Error>> : Result<T, Error>;
export function pluck<T, E = Error>(
  fn: () => T,
  errorMapper: (e: unknown) => E = defaultErrorMapper as (e: unknown) => E
) {
  try {
    const value = fn();

    if (types.isPromise(value)) {
      return value.then((v) => ok(v)).catch((e) => err(errorMapper(e)));
    }

    return ok(value);
  } catch (e) {
    return err(errorMapper(e));
  }
}
