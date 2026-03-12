import type { NextRequest } from "next/server";
import { createRouteMatcher } from "./route-matcher";

const createMockRequest = (pathname: string): NextRequest => {
  return {
    nextUrl: {
      pathname,
    },
  } as NextRequest;
};

describe("createRouteMatcher", () => {
  describe("request method", () => {
    describe("function matcher", () => {
      it("should use the provided function to match requests", () => {
        const matcher = createRouteMatcher(
          (req) => req.nextUrl.pathname === "/test"
        );
        expect(matcher.request(createMockRequest("/test"))).toBe(true);
        expect(matcher.request(createMockRequest("/other"))).toBe(false);
      });

      it("should pass the request object to the function", () => {
        const mockFn = jest.fn(() => true);
        const matcher = createRouteMatcher(mockFn);
        const request = createMockRequest("/test");
        matcher.request(request);
        expect(mockFn).toHaveBeenCalledWith(request);
      });
    });

    describe("string route matcher", () => {
      it("should match exact path", () => {
        const matcher = createRouteMatcher("/dashboard");
        expect(matcher.request(createMockRequest("/dashboard"))).toBe(true);
        expect(matcher.request(createMockRequest("/dashboard/"))).toBe(true);
        expect(matcher.request(createMockRequest("/dashboard/settings"))).toBe(false);
      });

      it("should match multiple string routes", () => {
        const matcher = createRouteMatcher(["/login", "/signup"]);
        expect(matcher.request(createMockRequest("/login"))).toBe(true);
        expect(matcher.request(createMockRequest("/signup"))).toBe(true);
        expect(matcher.request(createMockRequest("/dashboard"))).toBe(false);
      });

      it("should match routes with dynamic segments", () => {
        const matcher = createRouteMatcher("/users/:id");
        expect(matcher.request(createMockRequest("/users/123"))).toBe(true);
        expect(matcher.request(createMockRequest("/users/abc"))).toBe(true);
        expect(matcher.request(createMockRequest("/users"))).toBe(false);
        expect(matcher.request(createMockRequest("/users/123/posts"))).toBe(false);
      });

      it("should match routes with optional segments", () => {
        const matcher = createRouteMatcher("/posts{/:id}");
        expect(matcher.request(createMockRequest("/posts"))).toBe(true);
        expect(matcher.request(createMockRequest("/posts/123"))).toBe(true);
        expect(matcher.request(createMockRequest("/posts/123/comments"))).toBe(false);
      });

      it("should match routes with wildcards", () => {
        const matcher = createRouteMatcher("/api/*path");
        expect(matcher.request(createMockRequest("/api/users"))).toBe(true);
        expect(matcher.request(createMockRequest("/api/users/123"))).toBe(true);
        expect(matcher.request(createMockRequest("/api"))).toBe(false);
        expect(matcher.request(createMockRequest("/dashboard"))).toBe(false);
      });

      it("should match routes with catch-all segments", () => {
        const matcher = createRouteMatcher("/docs/*path");
        expect(matcher.request(createMockRequest("/docs/getting-started"))).toBe(true);
        expect(
          matcher.request(createMockRequest("/docs/getting-started/installation"))
        ).toBe(true);
        expect(matcher.request(createMockRequest("/docs"))).toBe(false);
      });
    });

    describe("RegExp matcher", () => {
      it("should match using a single RegExp", () => {
        const matcher = createRouteMatcher(/^\/api\/v\d+/);
        expect(matcher.request(createMockRequest("/api/v1"))).toBe(true);
        expect(matcher.request(createMockRequest("/api/v2/users"))).toBe(true);
        expect(matcher.request(createMockRequest("/api/users"))).toBe(false);
      });

      it("should match using multiple RegExp patterns", () => {
        const matcher = createRouteMatcher([/^\/admin/, /^\/dashboard/]);
        expect(matcher.request(createMockRequest("/admin/users"))).toBe(true);
        expect(matcher.request(createMockRequest("/dashboard"))).toBe(true);
        expect(matcher.request(createMockRequest("/settings"))).toBe(false);
      });
    });

    describe("mixed array matcher", () => {
      it("should match using mixed string and RegExp patterns", () => {
        const matcher = createRouteMatcher(["/login", /^\/api\/v\d+/, "/signup"]);
        expect(matcher.request(createMockRequest("/login"))).toBe(true);
        expect(matcher.request(createMockRequest("/api/v1"))).toBe(true);
        expect(matcher.request(createMockRequest("/signup"))).toBe(true);
        expect(matcher.request(createMockRequest("/dashboard"))).toBe(false);
      });
    });

    describe("edge cases", () => {
      it("should handle empty string", () => {
        const matcher = createRouteMatcher("");
        expect(matcher.request(createMockRequest("/"))).toBe(false);
        expect(matcher.request(createMockRequest("/dashboard"))).toBe(false);
      });

      it("should handle empty array", () => {
        const matcher = createRouteMatcher([]);
        expect(matcher.request(createMockRequest("/any"))).toBe(false);
      });

      it("should filter out falsy values", () => {
        const matcher = createRouteMatcher(["/login", "", "/signup"]);
        expect(matcher.request(createMockRequest("/login"))).toBe(true);
        expect(matcher.request(createMockRequest("/signup"))).toBe(true);
        expect(matcher.request(createMockRequest("/dashboard"))).toBe(false);
      });

      it("should handle root path", () => {
        const matcher = createRouteMatcher("/");
        expect(matcher.request(createMockRequest("/"))).toBe(true);
        expect(matcher.request(createMockRequest("/dashboard"))).toBe(false);
      });

      it("should handle paths with query strings (pathname only)", () => {
        const matcher = createRouteMatcher("/search");
        expect(matcher.request(createMockRequest("/search"))).toBe(true);
        expect(matcher.request(createMockRequest("/search"))).toBe(true);
      });
    });

    describe("complex route patterns", () => {
      it("should match nested dynamic routes", () => {
        const matcher = createRouteMatcher("/orgs/:orgId/users/:userId");
        expect(matcher.request(createMockRequest("/orgs/123/users/456"))).toBe(true);
        expect(matcher.request(createMockRequest("/orgs/123/users"))).toBe(false);
        expect(matcher.request(createMockRequest("/orgs/123"))).toBe(false);
      });

      it("should match routes with multiple segments", () => {
        const matcher = createRouteMatcher("/admin/orgs/:orgId");
        expect(matcher.request(createMockRequest("/admin/orgs/123"))).toBe(true);
        expect(matcher.request(createMockRequest("/admin/orgs"))).toBe(false);
        expect(matcher.request(createMockRequest("/orgs/123"))).toBe(false);
      });
    });

    describe("real-world scenarios", () => {
      it("should match Next.js app router patterns", () => {
        const matcher = createRouteMatcher([
          "/dashboard",
          "/settings/*path",
          "/admin/orgs/:orgId",
        ]);
        expect(matcher.request(createMockRequest("/dashboard"))).toBe(true);
        expect(matcher.request(createMockRequest("/settings/profile"))).toBe(true);
        expect(matcher.request(createMockRequest("/settings/api-keys"))).toBe(true);
        expect(matcher.request(createMockRequest("/admin/orgs/123"))).toBe(true);
        expect(matcher.request(createMockRequest("/login"))).toBe(false);
      });

      it("should match API routes", () => {
        const matcher = createRouteMatcher([
          /^\/api\/internal/,
          "/api/runtime/auth-check",
        ]);
        expect(matcher.request(createMockRequest("/api/internal/whoami"))).toBe(true);
        expect(matcher.request(createMockRequest("/api/internal/orgs"))).toBe(true);
        expect(matcher.request(createMockRequest("/api/runtime/auth-check"))).toBe(true);
        expect(matcher.request(createMockRequest("/api/public/users"))).toBe(false);
      });
    });
  });

  describe("path method", () => {
    describe("string route matcher", () => {
      it("should match exact path", () => {
        const matcher = createRouteMatcher("/dashboard");
        expect(matcher.path("/dashboard")).toBe(true);
        expect(matcher.path("/dashboard/")).toBe(true);
        expect(matcher.path("/dashboard/settings")).toBe(false);
      });

      it("should match multiple string routes", () => {
        const matcher = createRouteMatcher(["/login", "/signup"]);
        expect(matcher.path("/login")).toBe(true);
        expect(matcher.path("/signup")).toBe(true);
        expect(matcher.path("/dashboard")).toBe(false);
      });

      it("should match routes with dynamic segments", () => {
        const matcher = createRouteMatcher("/users/:id");
        expect(matcher.path("/users/123")).toBe(true);
        expect(matcher.path("/users/abc")).toBe(true);
        expect(matcher.path("/users")).toBe(false);
        expect(matcher.path("/users/123/posts")).toBe(false);
      });

      it("should match routes with wildcards", () => {
        const matcher = createRouteMatcher("/api/*path");
        expect(matcher.path("/api/users")).toBe(true);
        expect(matcher.path("/api/users/123")).toBe(true);
        expect(matcher.path("/api")).toBe(false);
      });
    });

    describe("RegExp matcher", () => {
      it("should match using a single RegExp", () => {
        const matcher = createRouteMatcher(/^\/api\/v\d+/);
        expect(matcher.path("/api/v1")).toBe(true);
        expect(matcher.path("/api/v2/users")).toBe(true);
        expect(matcher.path("/api/users")).toBe(false);
      });
    });

    describe("function matcher", () => {
      it("should use the provided function to match path via mock request", () => {
        const matcher = createRouteMatcher(
          (req) => req.nextUrl.pathname === "/test"
        );
        expect(matcher.path("/test")).toBe(true);
        expect(matcher.path("/other")).toBe(false);
      });
    });
  });

  describe("error handling", () => {
    it("should throw error for invalid path patterns", () => {
      expect(() => {
        createRouteMatcher("[/invalid");
      }).toThrow("Invalid path");
    });

    it("should include error message in thrown error", () => {
      try {
        createRouteMatcher("[/invalid");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("Invalid path");
        expect((error as Error).message).toContain("path-to-regexp");
      }
    });
  });
});
