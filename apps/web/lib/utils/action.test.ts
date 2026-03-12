import { z, ZodError } from "zod";
import { err, ok } from "@repo/result";
import { action, actionError } from "./action";

describe("action", () => {
  it("supports calling action with only a handler and no input", async () => {
    const run = action(async () => ok({ greeting: "Hello, World" }));

    const result = await run();

    expect(result).toEqual({ greeting: "Hello, World" });
  });

  it("throws handler error when called without schema", async () => {
    const run = action(async () => err(actionError("NOT_FOUND")));

    await expect(run()).rejects.toEqual({
      code: "NOT_FOUND",
      details: undefined,
    });
  });

  it("returns unwrapped value when input is valid", async () => {
    const schema = z.object({ name: z.string() });
    const run = action(schema, async (data) =>
      ok({ greeting: `Hello, ${data.name}` })
    );

    const result = await run({ name: "World" });

    expect(result).toEqual({ greeting: "Hello, World" });
  });

  it("calls handler with parsed data (coerced/transformed by schema)", async () => {
    const schema = z.object({ count: z.coerce.number() });
    const run = action(schema, async (data) => ok({ double: data.count * 2 }));

    // @ts-expect-error - test invalid shape
    const result = await run({ count: "42" });

    expect(result).toEqual({ double: 84 });
  });

  it("throws ValidationError when input fails schema validation", async () => {
    const schema = z.object({ name: z.string().min(1) });
    const run = action(schema, async () => ok(null));

    await expect(run({ name: "" })).rejects.toEqual({
      code: "VALIDATION_ERROR",
      details: expect.any(ZodError),
    });
  });

  it("throws ValidationError for invalid shape (e.g. missing required field)", async () => {
    const schema = z.object({ required: z.string() });
    const run = action(schema, async () => ok(null));

    // @ts-expect-error - test invalid shape
    await expect(run({})).rejects.toEqual({
      code: "VALIDATION_ERROR",
      details: expect.any(ZodError),
    });
  });

  it("throws handler error when handler returns err", async () => {
    const schema = z.object({ id: z.string() });
    const run = action(schema, async () => err(actionError("NOT_FOUND")));

    await expect(run({ id: "x" })).rejects.toEqual({
      code: "HANDLER_ERROR",
      details: { code: "NOT_FOUND", details: undefined },
    });
  });

  it("returns unwrapped value with custom success type", async () => {
    const schema = z.object({ query: z.string() });
    const run = action(schema, async (data) =>
      ok({ results: [data.query], total: 1 })
    );

    const result = await run({ query: "test" });

    expect(result).toEqual({ results: ["test"], total: 1 });
  });
});
