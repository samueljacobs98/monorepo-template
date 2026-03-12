# @repo/result

A TypeScript implementation of a `Result<T, E>` type for explicit, predictable error handling without exceptions.

## Philosophy

This package is built on three core principles:

### 1. Never Throw Errors

Traditional exception-based error handling makes it impossible to know which functions might throw just by looking at their type signature. Functions that throw create invisible control flow paths that can crash your application if not handled.

**With exceptions:**

```typescript
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

// The type signature doesn't tell us this can throw!
const result = divide(10, 0); // 💥 Crashes at runtime
```

**With Result:**

```typescript
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return err("Division by zero");
  return ok(a / b);
}

// The type signature explicitly shows possible failure
const result = divide(10, 0); // ✅ Always returns a value
```

### 2. Keep Functions Predictable

Functions should be predictable in their behavior. A function that returns `Result<T, E>` will always return a value—never throw, never return `undefined` unexpectedly, never have hidden failure modes.

**Predictable:**

```typescript
// Always returns a Result - no surprises
function fetchUser(id: number): Result<User, ApiError> {
  // ... implementation always returns ok() or err()
}

// The caller knows exactly what to expect
const userResult = fetchUser(123);
// userResult is ALWAYS a Result - guaranteed
```

**Unpredictable:**

```typescript
// Might return User, might throw, might return undefined?
function fetchUser(id: number): User {
  // ... who knows what happens on failure?
}
```

### 3. Make Error Handling Explicit

Error handling should be explicit and required. You cannot accidentally ignore errors—the type system forces you to handle both success and failure cases.

**Explicit handling:**

```typescript
const result = fetchUser(123);

// You MUST handle both cases explicitly
const user = await match(result, {
  ok: (user) => processUser(user),
  err: (error) => logError(error),
});
```

This prevents silent failures where errors are accidentally ignored.

## Installation

```bash
pnpm add @repo/result
```

## Usage

### Basic Usage

```typescript
import { err, ok, type Result } from "@repo/result";

// Creating results
const success = ok(42);
const failure = err("Something went wrong");

// Checking results
if (success.ok) {
  console.log(success.value); // 42
}

if (!failure.ok) {
  console.log(failure.error); // "Something went wrong"
}
```

### Transforming Values

```typescript
import { flatMap, map, mapErr } from "@repo/result";

// Map transforms the success value
const doubled = map(ok(21), (x) => x * 2);
// doubled is ok(42)

// mapErr transforms the error value (useful for normalizing errors)
const normalized = mapErr(err(new Error("Failed")), (e) => e.message);
// normalized is err("Failed")

// flatMap chains operations that return Results
const chained = flatMap(ok(5), (x) => {
  return x > 0 ? ok(x * 2) : err("Must be positive");
});
// chained is ok(10)
```

### Pattern Matching

```typescript
import { match } from "@repo/result";

const result = fetchUser(123);

// match requires handling both cases explicitly
const message = await match(result, {
  ok: (user) => `Welcome, ${user.name}!`,
  err: (error) => `Failed to load user: ${error}`,
});
```

The `match` function is async-aware, so you can use async functions in both arms:

```typescript
const response = await match(result, {
  ok: async (user) => {
    await saveToCache(user);
    return user;
  },
  err: async (error) => {
    await logError(error);
    return null;
  },
});
```

### Type Guards

```typescript
import { isErr, isOk } from "@repo/result";

const result = fetchUser(123);

if (isOk(result)) {
  // TypeScript knows result is Ok<User> here
  console.log(result.value.name);
}

if (isErr(result)) {
  // TypeScript knows result is Err<ApiError> here
  console.log(result.error.message);
}
```

### Wrapping Throwing Code with `pluck`

Use `pluck` to wrap sync or async functions that may throw and get a `Result` instead. Sync functions return `Result<T, E>`; async functions return `Promise<Result<T, E>>`.

```typescript
import { pluck } from "@repo/result";

// Sync: wraps thrown exceptions into Result
const result = pluck(
  () => JSON.parse(input),
  (e) => new Error(String(e))
);
// result is Result<unknown, Error>

// Async: wraps rejections and thrown exceptions into Result
const userResult = await pluck(
  async () => await db.getUser(1),
  (e) => new Error(e instanceof Error ? e.message : String(e))
);
// userResult is Result<User, Error>
```

You can omit the error mapper to use the default (unknown → `Error`):

```typescript
const result = pluck(() => riskySyncCall());
const asyncResult = await pluck(async () => await riskyAsyncCall());
```

## API Reference

### Types

- `Result<T, E>` - A discriminated union of `Ok<T>` or `Err<E>`
- `Ok<T>` - Success variant containing a value of type `T`
- `Err<E>` - Error variant containing an error of type `E`

### Constructors

- `ok<T>(value: T): Ok<T>` - Create a success result
- `err<E>(error: E): Err<E>` - Create an error result

### Utilities

- `isOk<T, E>(result: Result<T, E>): result is Ok<T>` - Type guard for success
- `isErr<T, E>(result: Result<T, E>): result is Err<E>` - Type guard for error
- `map<T, U, E>(r: Result<T, E>, fn: (t: T) => U): Result<U, E>` - Transform success value
- `mapErr<T, E, F>(r: Result<T, E>, fn: (e: E) => F): Result<T, F>` - Transform error value
- `flatMap<T, U, E>(r: Result<T, E>, fn: (t: T) => Result<U, E>): Result<U, E>` - Chain Results
- `match<T, E, U>(r: Result<T, E>, arms: { ok: (t: T) => U | Promise<U>; err: (e: E) => U | Promise<U> }): Promise<U>` - Pattern match with explicit handling

### Type Utilities

- `ExtractOk<T>` - Extract the value type from an `Ok<T>`
- `ExtractErr<T>` - Extract the error type from an `Err<E>`

## Real-World Example

```typescript
import { err, flatMap, match, ok, type Result } from "@repo/result";

type User = { id: number; name: string; email: string };
type UserError = "NOT_FOUND" | "INVALID_ID" | "DATABASE_ERROR";

async function fetchUser(id: number): Promise<Result<User, UserError>> {
  if (id <= 0) return err("INVALID_ID");

  try {
    const user = await db.users.findById(id);
    if (!user) return err("NOT_FOUND");
    return ok(user);
  } catch {
    return err("DATABASE_ERROR");
  }
}

async function validateUser(user: User): Promise<Result<User, string>> {
  if (!user.email.includes("@")) {
    return err("Invalid email format");
  }
  return ok(user);
}

// Composing operations
async function getUserAndValidate(id: number) {
  const result = await fetchUser(id);

  const validated = await flatMap(result, async (user) => {
    return validateUser(user);
  });

  return await match(validated, {
    ok: (user) => ({ status: "success", user }),
    err: (error) => ({ status: "error", message: error }),
  });
}
```

## Benefits

1. **Type Safety**: The type system enforces error handling
2. **No Surprises**: Functions never throw—errors are always values
3. **Composability**: Easily chain operations with `flatMap`
4. **Explicit**: You cannot ignore errors—handling is required
5. **Predictable**: Function signatures tell the complete story
