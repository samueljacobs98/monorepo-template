import type { input as ZodInput, output as ZodOutput, ZodType } from "zod";
import { err, isErr, type Result } from "@repo/result";

export function action<THandlerSuccess, THandlerError>(
  handler: () => Promise<Result<THandlerSuccess, THandlerError>>
): () => Promise<THandlerSuccess>;

export function action<TSchema extends ZodType, THandlerSuccess, THandlerError>(
  schema: TSchema,
  handler: (
    data: ZodOutput<TSchema>
  ) => Promise<Result<THandlerSuccess, THandlerError>>
): (input: ZodInput<TSchema>) => Promise<THandlerSuccess>;

export function action<TSchema extends ZodType, THandlerSuccess, THandlerError>(
  schemaOrHandler:
    | TSchema
    | (() => Promise<Result<THandlerSuccess, THandlerError>>),
  maybeHandler?: (
    data: ZodOutput<TSchema>
  ) => Promise<Result<THandlerSuccess, THandlerError>>
) {
  if (typeof schemaOrHandler === "function") {
    const handler = schemaOrHandler;
    return async () => {
      const result = await handler();
      if (isErr(result)) throw result.error;
      return result.value;
    };
  }

  const schema = schemaOrHandler;
  const handler = maybeHandler;
  if (!handler) {
    throw new TypeError("action requires a handler when schema is provided");
  }

  return async (input: ZodInput<TSchema>) => {
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      throw actionError("VALIDATION_ERROR", parsed.error);
    }
    const result = await handler(parsed.data).catch((error) => err(error));
    if (isErr(result)) throw actionError("HANDLER_ERROR", result.error);
    return result.value;
  };
}

export function actionError<T extends string>(
  code: T
): {
  code: T;
  details: undefined;
};
export function actionError<T extends string, D>(
  code: T,
  details: D
): {
  code: T;
  details: D;
};
export function actionError<T extends string, D>(code: T, details?: D) {
  return { code, details };
}
