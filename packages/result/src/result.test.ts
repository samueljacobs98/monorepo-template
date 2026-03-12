import { err, type Err, ok, type Ok, type Result } from "./result";

describe("ok", () => {
  it("should create an Ok result with a value", () => {
    const result = ok(42);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(42);
  });

  it("should create an Ok result with string value", () => {
    const result = ok("success");
    expect(result.ok).toBe(true);
    expect(result.value).toBe("success");
  });

  it("should create an Ok result with object value", () => {
    const value = { id: 1, name: "test" };
    const result = ok(value);
    expect(result.ok).toBe(true);
    expect(result.value).toEqual(value);
  });

  it("should create an Ok result with null value", () => {
    const result = ok(null);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(null);
  });

  it("should create an Ok result with undefined value", () => {
    const result = ok(undefined);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(undefined);
  });

  it("should have readonly properties", () => {
    const result = ok(42);
    expect(result).toHaveProperty("ok", true);
    expect(result).toHaveProperty("value", 42);
  });

  it("should satisfy Ok type", () => {
    const result: Ok<number> = ok(42);
    expect(result.ok).toBe(true);
  });
});

describe("err", () => {
  it("should create an Err result with an error", () => {
    const error = new Error("Something went wrong");
    const result = err(error);
    expect(result.ok).toBe(false);
    expect(result.error).toBe(error);
  });

  it("should create an Err result with string error", () => {
    const result = err("error message");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("error message");
  });

  it("should create an Err result with number error", () => {
    const result = err(404);
    expect(result.ok).toBe(false);
    expect(result.error).toBe(404);
  });

  it("should create an Err result with object error", () => {
    const error = { code: "E001", message: "Custom error" };
    const result = err(error);
    expect(result.ok).toBe(false);
    expect(result.error).toEqual(error);
  });

  it("should have readonly properties", () => {
    const result = err("error");
    expect(result).toHaveProperty("ok", false);
    expect(result).toHaveProperty("error", "error");
  });

  it("should satisfy Err type", () => {
    const result: Err<string> = err("error");
    expect(result.ok).toBe(false);
  });
});

describe("Result type", () => {
  it("should discriminate between Ok and Err", () => {
    const okResult: Result<number, string> = ok(42);
    const errResult: Result<number, string> = err("error");

    if (okResult.ok) {
      expect(okResult.value).toBe(42);
      // @ts-expect-error - error should not exist on Ok
      expect(okResult.error).toBeUndefined();
    }

    if (!errResult.ok) {
      expect(errResult.error).toBe("error");
      // @ts-expect-error - value should not exist on Err
      expect(errResult.value).toBeUndefined();
    }
  });

  it("should work with different value and error types", () => {
    const result1: Result<string, number> = ok("success");
    const result2: Result<string, number> = err(404);

    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(false);
  });
});
