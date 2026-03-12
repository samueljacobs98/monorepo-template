import { err, ok, type Result } from "./result";
import { flatMap, isErr, isOk, map, mapErr, match, pluck } from "./utils";

describe("isOk", () => {
  it("should return true for Ok results", () => {
    const result = ok(42);
    expect(isOk(result)).toBe(true);
  });

  it("should return false for Err results", () => {
    const result = err("error");
    expect(isOk(result)).toBe(false);
  });

  it("should act as a type guard", () => {
    const result: Result<number, string> = ok(42);
    if (isOk(result)) {
      expect(result.value).toBe(42);
      // @ts-expect-error - error should not exist on Ok
      expect(result.error).toBeUndefined();
    }
  });

  it("should work with various value types", () => {
    expect(isOk(ok(42))).toBe(true);
    expect(isOk(ok("test"))).toBe(true);
    expect(isOk(ok(null))).toBe(true);
    expect(isOk(ok(undefined))).toBe(true);
  });
});

describe("isErr", () => {
  it("should return true for Err results", () => {
    const result = err("error");
    expect(isErr(result)).toBe(true);
  });

  it("should return false for Ok results", () => {
    const result = ok(42);
    expect(isErr(result)).toBe(false);
  });

  it("should act as a type guard", () => {
    const result: Result<number, string> = err("error");
    if (isErr(result)) {
      expect(result.error).toBe("error");
      // @ts-expect-error - value should not exist on Err
      expect(result.value).toBeUndefined();
    }
  });

  it("should work with various error types", () => {
    expect(isErr(err("error"))).toBe(true);
    expect(isErr(err(404))).toBe(true);
    expect(isErr(err(new Error("test")))).toBe(true);
  });
});

describe("map", () => {
  it("should map over Ok values", () => {
    const result = ok(42);
    const mapped = map(result, (x) => x * 2);
    expect(mapped.ok).toBe(true);
    if (mapped.ok) {
      expect(mapped.value).toBe(84);
    }
  });

  it("should leave Err unchanged", () => {
    const result = err("error");
    const mapped = map(result, (x: number) => x * 2);
    expect(mapped.ok).toBe(false);
    if (!mapped.ok) {
      expect(mapped.error).toBe("error");
    }
  });

  it("should change the value type", () => {
    const result = ok(42);
    const mapped = map(result, (x) => x.toString());
    expect(mapped.ok).toBe(true);
    if (mapped.ok) {
      expect(mapped.value).toBe("42");
      expect(typeof mapped.value).toBe("string");
    }
  });

  it("should preserve error type", () => {
    const result: Result<number, string> = err("error");
    const mapper = (x: number) => x * 2;
    const mapped = map(result, mapper);
    if (!mapped.ok) {
      expect(mapped.error).toBe("error");
      expect(typeof mapped.error).toBe("string");
    }
  });

  it("should work with async-like transformations", () => {
    const result = ok({ count: 5 });
    const mapped = map(result, (obj) => ({ ...obj, doubled: obj.count * 2 }));
    expect(mapped.ok).toBe(true);
    if (mapped.ok) {
      expect(mapped.value).toEqual({ count: 5, doubled: 10 });
    }
  });

  it("should handle null and undefined values", () => {
    const result1 = ok(null);
    const mapped1 = map(result1, () => "not null");
    expect(mapped1.ok).toBe(true);
    if (mapped1.ok) {
      expect(mapped1.value).toBe("not null");
    }

    const result2 = ok(undefined);
    const mapped2 = map(result2, () => "defined");
    expect(mapped2.ok).toBe(true);
    if (mapped2.ok) {
      expect(mapped2.value).toBe("defined");
    }
  });
});

describe("mapErr", () => {
  it("should map over Err values", () => {
    const result = err(404);
    const mapped = mapErr(result, (e) => `Error ${e}`);
    expect(mapped.ok).toBe(false);
    if (!mapped.ok) {
      expect(mapped.error).toBe("Error 404");
    }
  });

  it("should leave Ok unchanged", () => {
    const result = ok(42);
    const mapped = mapErr(result, (e: string) => e.toUpperCase());
    expect(mapped.ok).toBe(true);
    if (mapped.ok) {
      expect(mapped.value).toBe(42);
    }
  });

  it("should change the error type", () => {
    const result = err(new Error("Something went wrong"));
    const mapped = mapErr(result, (e) => e.message);
    expect(mapped.ok).toBe(false);
    if (!mapped.ok) {
      expect(mapped.error).toBe("Something went wrong");
      expect(typeof mapped.error).toBe("string");
    }
  });

  it("should preserve value type", () => {
    const result: Result<number, Error> = ok(42);
    const mapper = (e: Error) => e.message;
    const mapped = mapErr(result, mapper);
    if (mapped.ok) {
      expect(mapped.value).toBe(42);
      expect(typeof mapped.value).toBe("number");
    }
  });

  it("should normalize errors at boundaries", () => {
    const result = err({ code: 500, message: "Internal error" });
    const mapper = (e: { code: number; message: string }) => e.message;
    const mapped = mapErr(result, mapper);
    expect(mapped.ok).toBe(false);
    if (!mapped.ok) {
      expect(mapped.error).toBe("Internal error");
    }
  });
});

describe("flatMap", () => {
  it("should flat-map over Ok values", () => {
    const result = ok(42);
    const mapper = (x: number) => ok(x * 2);
    const flatMapped = flatMap(result, mapper);
    expect(flatMapped.ok).toBe(true);
    if (flatMapped.ok) {
      expect(flatMapped.value).toBe(84);
    }
  });

  it("should pass through Err unchanged", () => {
    const result = err("error");
    const mapper = (x: number) => ok(x * 2);
    const flatMapped = flatMap(result, mapper);
    expect(flatMapped.ok).toBe(false);
    if (!flatMapped.ok) {
      expect(flatMapped.error).toBe("error");
    }
  });

  it("should propagate Err from the function", () => {
    const result = ok(42);
    const mapper = () => err("new error");
    const flatMapped = flatMap(result, mapper);
    expect(flatMapped.ok).toBe(false);
    if (!flatMapped.ok) {
      expect(flatMapped.error).toBe("new error");
    }
  });

  it("should chain multiple operations", () => {
    const result = ok(5);
    const mapper1 = (x: number) => ok(x + 10);
    const step1 = flatMap(result, mapper1);
    const mapper2 = (x: number) => ok(x * 2);
    const step2 = flatMap(step1, mapper2);
    expect(step2.ok).toBe(true);
    if (step2.ok) {
      expect(step2.value).toBe(30);
    }
  });

  it("should change the value type", () => {
    const result = ok(42);
    const mapper = (x: number) => ok(x.toString());
    const flatMapped = flatMap(result, mapper);
    expect(flatMapped.ok).toBe(true);
    if (flatMapped.ok) {
      expect(flatMapped.value).toBe("42");
      expect(typeof flatMapped.value).toBe("string");
    }
  });

  it("should handle conditional logic", () => {
    const divide = (n: number, d: number): Result<number, string> =>
      d === 0 ? err("Division by zero") : ok(n / d);

    const result1 = ok(10);
    const mapper1 = (x: number) => divide(x, 2);
    const result2 = flatMap(result1, mapper1);
    expect(result2.ok).toBe(true);
    if (result2.ok) {
      expect(result2.value).toBe(5);
    }

    const result3 = ok(10);
    const mapper2 = (x: number) => divide(x, 0);
    const result4 = flatMap(result3, mapper2);
    expect(result4.ok).toBe(false);
    if (!result4.ok) {
      expect(result4.error).toBe("Division by zero");
    }
  });

  it("should preserve error type", () => {
    const result: Result<number, string> = err("error");
    const mapper = (x: number) => ok(x * 2);
    const flatMapped = flatMap(result, mapper);
    if (!flatMapped.ok) {
      expect(flatMapped.error).toBe("error");
      expect(typeof flatMapped.error).toBe("string");
    }
  });
});

describe("match", () => {
  it("should match Ok values synchronously", async () => {
    const result = ok(42);
    const okMapper = (x: number) => x * 2;
    const errMapper = () => 0;
    const matched = await match(result, {
      ok: okMapper,
      err: errMapper,
    });
    expect(matched).toBe(84);
  });

  it("should match Err values synchronously", async () => {
    const result = err("error");
    const okMapper = () => "success";
    const errMapper = (e: string) => `Failed: ${e}`;
    const matched = await match(result, {
      ok: okMapper,
      err: errMapper,
    });
    expect(matched).toBe("Failed: error");
  });

  it("should handle async ok arm", async () => {
    const result = ok(42);
    const okMapper = async (x: number) => {
      await Promise.resolve();
      return x * 2;
    };
    const errMapper = async () => {
      await Promise.resolve();
      return 0;
    };
    const matched = await match(result, {
      ok: okMapper,
      err: errMapper,
    });
    expect(matched).toBe(84);
  });

  it("should handle async err arm", async () => {
    const result = err("error");
    const okMapper = () => "success";
    const errMapper = async (e: string) => {
      await Promise.resolve();
      return `Failed: ${e}`;
    };
    const matched = await match(result, {
      ok: okMapper,
      err: errMapper,
    });
    expect(matched).toBe("Failed: error");
  });

  it("should handle both async arms", async () => {
    const result = ok(42);
    const okMapper = async (x: number) => {
      await Promise.resolve();
      return x * 2;
    };
    const errMapper = async () => {
      await Promise.resolve();
      return 0;
    };
    const matched = await match(result, {
      ok: okMapper,
      err: errMapper,
    });
    expect(matched).toBe(84);
  });

  it("should work with complex transformations", async () => {
    const result = ok({ id: 1, name: "test" });
    const okMapper = (obj: { id: number; name: string }) =>
      `${obj.name} (${obj.id})`;
    const errMapper = () => "Unknown";
    const matched = await match(result, {
      ok: okMapper,
      err: errMapper,
    });
    expect(matched).toBe("test (1)");
  });

  it("should handle promise rejections in ok arm", async () => {
    const result = ok(42);
    const okMapper = async () => {
      throw new Error("Test error");
    };
    const errMapper = () => 0;
    await expect(
      match(result, {
        ok: okMapper,
        err: errMapper,
      })
    ).rejects.toThrow("Test error");
  });

  it("should handle promise rejections in err arm", async () => {
    const result = err("error");
    const okMapper = () => "success";
    const errMapper = async () => {
      throw new Error("Test error");
    };
    await expect(
      match(result, {
        ok: okMapper,
        err: errMapper,
      })
    ).rejects.toThrow("Test error");
  });

  it("should maintain type safety", async () => {
    const result: Result<number, string> = ok(42);
    const okMapper = (x: number) => x.toString();
    const errMapper = (e: string) => e;
    const matched = await match<number, string, string>(result, {
      ok: okMapper,
      err: errMapper,
    });
    expect(matched).toBe("42");
  });
});

describe("pluck", () => {
  it("should return an ok result for a sync function", () => {
    const fn = () => 42;
    const errorMapper = (e: unknown) => new Error(e as string);
    const result = pluck(fn, errorMapper);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it("should return an err result for a sync function that throws", () => {
    const fn = (): unknown => {
      throw new Error("test");
    };
    const errorMapper = (e: unknown) =>
      e instanceof Error ? e : new Error(String(e));
    const result = pluck(fn, errorMapper);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("test");
    }
  });

  it("should return an ok result for a async function", async () => {
    const fn = async () => 42;
    const errorMapper = (e: unknown) => new Error(e as string);
    const result = await pluck(fn, errorMapper);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it("should return an err result for a async function that throws", async () => {
    const fn = async () => {
      throw new Error("test");
    };
    const errorMapper = (e: unknown) =>
      e instanceof Error ? e : new Error(String(e));
    const result = await pluck(fn, errorMapper);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("test");
    }
  });

  it("should use the default error mapper when no error mapper is provided", () => {
    const fn = (): unknown => {
      throw "test";
    };
    const result = pluck(fn);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("test");
    }
  });

  it("should use the default error mapper when no error mapper is provided and the function is async", async () => {
    const fn = async (): Promise<unknown> => {
      await Promise.resolve();
      throw "test";
    };
    const result = await pluck(fn);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("test");
    }
  });
});
