// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

function request(path: string, loggedIn: boolean): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: loggedIn ? { cookie: "civic_token=abc" } : {},
  });
}

function redirectTarget(path: string, loggedIn: boolean): string | null {
  const location = proxy(request(path, loggedIn)).headers.get("location");
  return location === null ? null : new URL(location).pathname;
}

describe("proxy", () => {
  it("sends an anonymous visitor to the login page", () => {
    expect(redirectTarget("/", false)).toBe("/login");
    expect(redirectTarget("/articles", false)).toBe("/login");
  });

  it("lets an anonymous visitor reach the login, forgotten-password and reset pages", () => {
    expect(redirectTarget("/login", false)).toBeNull();
    expect(redirectTarget("/forgot-password", false)).toBeNull();
    expect(redirectTarget("/reset-password", false)).toBeNull();
  });

  it("sends someone already signed in away from the login page, and only that one", () => {
    expect(redirectTarget("/login", true)).toBe("/");
    expect(redirectTarget("/forgot-password", true)).toBeNull();
    expect(redirectTarget("/reset-password", true)).toBeNull();
    expect(redirectTarget("/articles", true)).toBeNull();
  });

  it("does not open other pages that merely start like a public one", () => {
    expect(redirectTarget("/login-admin", false)).toBe("/login");
    expect(redirectTarget("/reset-password/extra", false)).toBe("/login");
  });
});
