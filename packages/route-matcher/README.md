# @repo/route-matcher

A utility for matching Next.js requests against predefined route patterns. Useful for middleware, auth checks, and conditional logic based on the current pathname.

Adapted from [Clerk](https://clerk.com). See the [source file](./src/route-matcher.ts) for license details.

## Installation

This package is part of the workspace. Add it as a dependency:

```bash
pnpm add @repo/route-matcher
```

## Usage

`createRouteMatcher` returns a function that accepts a `NextRequest` and returns `true` if the request pathname matches any of the provided routes.

```typescript
import { createRouteMatcher } from "@repo/route-matcher";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/login", "/signup"]);

export function middleware(req: NextRequest) {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  // Protected route logic...
}
```

### Route Patterns

#### String routes

Exact path matching (trailing slashes are normalized):

```typescript
createRouteMatcher("/dashboard"); // matches /dashboard and /dashboard/
createRouteMatcher(["/login", "/signup"]);
```

#### Dynamic segments

Use `:param` for path parameters:

```typescript
createRouteMatcher("/users/:id"); // matches /users/123, /users/abc
createRouteMatcher("/orgs/:orgId/users/:userId");
```

#### Optional segments

Use `{/:segment}` for optional parts:

```typescript
createRouteMatcher("/posts{/:id}"); // matches /posts and /posts/123
```

#### Wildcards

Use `*param` for catch-all segments:

```typescript
createRouteMatcher("/api/*path"); // matches /api/users, /api/users/123
createRouteMatcher("/docs/*path"); // matches /docs/getting-started/installation
```

#### Regular expressions

Pass a `RegExp` for custom matching:

```typescript
createRouteMatcher(/^\/api\/v\d+/); // matches /api/v1, /api/v2, etc.
createRouteMatcher([/^\/admin/, /^\/dashboard/]);
```

#### Custom function

For full control, pass a function that receives the request:

```typescript
createRouteMatcher((req) => req.nextUrl.pathname.startsWith("/api"));
```

### Mixed patterns

You can combine strings, RegExps, and more in a single array:

```typescript
createRouteMatcher([
  "/login",
  "/signup",
  /^\/api\/internal/,
  "/settings/*path",
]);
```

## API

### `createRouteMatcher(routes)`

Creates a matcher function for the given routes.

**Parameters:**

- `routes` — `string | string[] | RegExp | RegExp[] | (req: NextRequest) => boolean`

**Returns:** `(req: NextRequest) => boolean`

Path patterns follow [path-to-regexp](https://github.com/pillarjs/path-to-regexp) syntax.

## Dependencies

- **next** — For `NextRequest` types
- **path-to-regexp** — Path pattern parsing and matching
