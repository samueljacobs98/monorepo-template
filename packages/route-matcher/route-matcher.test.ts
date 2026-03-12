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
  describe("function matcher", () => {
    it("should use the provided function to match requests", () => {
      const matcher = createRouteMatcher(
        (req) => req.nextUrl.pathname === "/test"
      );
      expect(matcher(createMockRequest("/test"))).toBe(true);
      expect(matcher(createMockRequest("/other"))).toBe(false);
    });

    it("should pass the request object to the function", () => {
      const mockFn = jest.fn(() => true);
      const matcher = createRouteMatcher(mockFn);
      const request = createMockRequest("/test");
      matcher(request);
      expect(mockFn).toHaveBeenCalledWith(request);
    });
  });

  describe("string route matcher", () => {
    it("should match exact path", () => {
      const matcher = createRouteMatcher("/dashboard");
      expect(matcher(createMockRequest("/dashboard"))).toBe(true);
      expect(matcher(createMockRequest("/dashboard/"))).toBe(true);
      expect(matcher(createMockRequest("/dashboard/settings"))).toBe(false);
    });

    it("should match multiple string routes", () => {
      const matcher = createRouteMatcher(["/login", "/signup"]);
      expect(matcher(createMockRequest("/login"))).toBe(true);
      expect(matcher(createMockRequest("/signup"))).toBe(true);
      expect(matcher(createMockRequest("/dashboard"))).toBe(false);
    });

    it("should match routes with dynamic segments", () => {
      const matcher = createRouteMatcher("/users/:id");
      expect(matcher(createMockRequest("/users/123"))).toBe(true);
      expect(matcher(createMockRequest("/users/abc"))).toBe(true);
      expect(matcher(createMockRequest("/users"))).toBe(false);
      expect(matcher(createMockRequest("/users/123/posts"))).toBe(false);
    });

    it("should match routes with optional segments", () => {
      const matcher = createRouteMatcher("/posts{/:id}");
      expect(matcher(createMockRequest("/posts"))).toBe(true);
      expect(matcher(createMockRequest("/posts/123"))).toBe(true);
      expect(matcher(createMockRequest("/posts/123/comments"))).toBe(false);
    });

    it("should match routes with wildcards", () => {
      const matcher = createRouteMatcher("/api/*path");
      expect(matcher(createMockRequest("/api/users"))).toBe(true);
      expect(matcher(createMockRequest("/api/users/123"))).toBe(true);
      expect(matcher(createMockRequest("/api"))).toBe(false);
      expect(matcher(createMockRequest("/dashboard"))).toBe(false);
    });

    it("should match routes with catch-all segments", () => {
      const matcher = createRouteMatcher("/docs/*path");
      expect(matcher(createMockRequest("/docs/getting-started"))).toBe(true);
      expect(
        matcher(createMockRequest("/docs/getting-started/installation"))
      ).toBe(true);
      expect(matcher(createMockRequest("/docs"))).toBe(false);
    });
  });

  describe("RegExp matcher", () => {
    it("should match using a single RegExp", () => {
      const matcher = createRouteMatcher(/^\/api\/v\d+/);
      expect(matcher(createMockRequest("/api/v1"))).toBe(true);
      expect(matcher(createMockRequest("/api/v2/users"))).toBe(true);
      expect(matcher(createMockRequest("/api/users"))).toBe(false);
    });

    it("should match using multiple RegExp patterns", () => {
      const matcher = createRouteMatcher([/^\/admin/, /^\/dashboard/]);
      expect(matcher(createMockRequest("/admin/users"))).toBe(true);
      expect(matcher(createMockRequest("/dashboard"))).toBe(true);
      expect(matcher(createMockRequest("/settings"))).toBe(false);
    });
  });

  describe("mixed array matcher", () => {
    it("should match using mixed string and RegExp patterns", () => {
      const matcher = createRouteMatcher(["/login", /^\/api\/v\d+/, "/signup"]);
      expect(matcher(createMockRequest("/login"))).toBe(true);
      expect(matcher(createMockRequest("/api/v1"))).toBe(true);
      expect(matcher(createMockRequest("/signup"))).toBe(true);
      expect(matcher(createMockRequest("/dashboard"))).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const matcher = createRouteMatcher("");
      expect(matcher(createMockRequest("/"))).toBe(false);
      expect(matcher(createMockRequest("/dashboard"))).toBe(false);
    });

    it("should handle empty array", () => {
      const matcher = createRouteMatcher([]);
      expect(matcher(createMockRequest("/any"))).toBe(false);
    });

    it("should filter out falsy values", () => {
      const matcher = createRouteMatcher(["/login", "", "/signup"]);
      expect(matcher(createMockRequest("/login"))).toBe(true);
      expect(matcher(createMockRequest("/signup"))).toBe(true);
      expect(matcher(createMockRequest("/dashboard"))).toBe(false);
    });

    it("should handle root path", () => {
      const matcher = createRouteMatcher("/");
      expect(matcher(createMockRequest("/"))).toBe(true);
      expect(matcher(createMockRequest("/dashboard"))).toBe(false);
    });

    it("should handle paths with query strings (pathname only)", () => {
      const matcher = createRouteMatcher("/search");
      expect(matcher(createMockRequest("/search"))).toBe(true);
      expect(matcher(createMockRequest("/search"))).toBe(true);
    });
  });

  describe("complex route patterns", () => {
    it("should match nested dynamic routes", () => {
      const matcher = createRouteMatcher("/orgs/:orgId/users/:userId");
      expect(matcher(createMockRequest("/orgs/123/users/456"))).toBe(true);
      expect(matcher(createMockRequest("/orgs/123/users"))).toBe(false);
      expect(matcher(createMockRequest("/orgs/123"))).toBe(false);
    });

    it("should match routes with multiple segments", () => {
      const matcher = createRouteMatcher("/admin/orgs/:orgId");
      expect(matcher(createMockRequest("/admin/orgs/123"))).toBe(true);
      expect(matcher(createMockRequest("/admin/orgs"))).toBe(false);
      expect(matcher(createMockRequest("/orgs/123"))).toBe(false);
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

  describe("real-world scenarios", () => {
    it("should match Next.js app router patterns", () => {
      const matcher = createRouteMatcher([
        "/dashboard",
        "/settings/*path",
        "/admin/orgs/:orgId",
      ]);
      expect(matcher(createMockRequest("/dashboard"))).toBe(true);
      expect(matcher(createMockRequest("/settings/profile"))).toBe(true);
      expect(matcher(createMockRequest("/settings/api-keys"))).toBe(true);
      expect(matcher(createMockRequest("/admin/orgs/123"))).toBe(true);
      expect(matcher(createMockRequest("/login"))).toBe(false);
    });

    it("should match API routes", () => {
      const matcher = createRouteMatcher([
        /^\/api\/internal/,
        "/api/runtime/auth-check",
      ]);
      expect(matcher(createMockRequest("/api/internal/whoami"))).toBe(true);
      expect(matcher(createMockRequest("/api/internal/orgs"))).toBe(true);
      expect(matcher(createMockRequest("/api/runtime/auth-check"))).toBe(true);
      expect(matcher(createMockRequest("/api/public/users"))).toBe(false);
    });
  });
});
