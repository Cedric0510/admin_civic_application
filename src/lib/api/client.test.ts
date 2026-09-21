import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getMock = vi.fn();
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: getMock }),
}));

// Imported after the mock above so `cookies` resolves to the fake.
const { api, ApiError } = await import("./client");

describe("api client", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    getMock.mockReturnValue(undefined);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("GET returns the decoded JSON body", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "1" }), { status: 200 }),
    );

    await expect(api.get("/articles")).resolves.toEqual({ id: "1" });
  });

  it("returns undefined for a 204 response", async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

    await expect(api.delete("/articles/1")).resolves.toBeUndefined();
  });

  it("attaches the Authorization header when a token cookie is present", async () => {
    getMock.mockReturnValue({ value: "abc123" });
    let capturedHeaders: Headers | undefined;
    global.fetch = vi.fn().mockImplementation((_url, init) => {
      capturedHeaders = init.headers as Headers;
      return Promise.resolve(new Response("{}", { status: 200 }));
    });

    await api.get("/staff/me");

    expect(capturedHeaders?.get("Authorization")).toBe("Bearer abc123");
  });

  it("omits the Authorization header when there is no token cookie", async () => {
    let capturedHeaders: Headers | undefined;
    global.fetch = vi.fn().mockImplementation((_url, init) => {
      capturedHeaders = init.headers as Headers;
      return Promise.resolve(new Response("{}", { status: 200 }));
    });

    await api.get("/articles");

    expect(capturedHeaders?.has("Authorization")).toBe(false);
  });

  it("JSON-encodes a plain object body and sets Content-Type", async () => {
    let capturedInit: RequestInit | undefined;
    global.fetch = vi.fn().mockImplementation((_url, init) => {
      capturedInit = init as RequestInit;
      return Promise.resolve(new Response("{}", { status: 201 }));
    });

    await api.post("/citizens/login", { email: "a@b.com" });

    expect(capturedInit?.body).toBe(JSON.stringify({ email: "a@b.com" }));
    expect((capturedInit?.headers as Headers).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("passes a FormData body through untouched, without forcing Content-Type", async () => {
    const formData = new FormData();
    formData.append("file", new Blob(["x"]), "x.png");
    let capturedInit: RequestInit | undefined;
    global.fetch = vi.fn().mockImplementation((_url, init) => {
      capturedInit = init as RequestInit;
      return Promise.resolve(new Response("{}", { status: 201 }));
    });

    await api.post("/uploads", formData);

    expect(capturedInit?.body).toBe(formData);
    expect((capturedInit?.headers as Headers).has("Content-Type")).toBe(false);
  });

  it("throws ApiError with the server message on a non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Article introuvable." }), {
        status: 404,
      }),
    );

    await expect(api.get("/articles/x")).rejects.toMatchObject({
      status: 404,
      message: "Article introuvable.",
    });
  });

  it("joins a NestJS-style list of validation messages", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: ["email must be an email", "password too short"],
        }),
        { status: 400 },
      ),
    );

    await expect(api.post("/citizens/signup", {})).rejects.toMatchObject({
      status: 400,
      message: "email must be an email, password too short",
    });
  });

  it("falls back to a generic message when the error body is not JSON", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("not json", { status: 500 }),
    );

    await expect(api.get("/x")).rejects.toMatchObject({
      status: 500,
      message: "Une erreur est survenue.",
    });
  });

  it("wraps a transport failure as a status-0 ApiError", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    await expect(api.get("/x")).rejects.toBeInstanceOf(ApiError);
    await expect(api.get("/x")).rejects.toMatchObject({
      status: 0,
      message: "Impossible de contacter le serveur.",
    });
  });
});
