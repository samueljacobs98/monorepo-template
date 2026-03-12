import type { Err, Ok } from "./result";

/**
 * Extract the value type from an Ok Result.
 * @param T - The Result to extract the value from.
 * @returns The value type.
 * @example ExtractOk<Result<string, number>> // string
 */
export type ExtractOk<T> = T extends Ok<infer U> ? U : never;

/**
 * Extract the error type from an Err Result.
 * @param T - The Result to extract the error from.
 * @returns The error type.
 * @example ExtractErr<Result<string, number>> // number
 */
export type ExtractErr<T> = T extends Err<infer U> ? U : never;
