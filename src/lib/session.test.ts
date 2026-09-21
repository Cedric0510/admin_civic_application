import { describe, expect, it, vi } from "vitest";

const getMock = vi.fn();
vi.mock("./api/client", async () => {
  const actual = await vi.importActual<typeof import("./api/client")>(
    "./api/client",
  );
  return { ...actual, api: { get: getMock } };
});

const { getCurrentStaff } = await import("./session");
const { ApiError } = await import("./api/client");

describe("getCurrentStaff", () => {
  it("returns the staff profile when the token is valid", async () => {
    const staff = {
      id: "1",
      email: "a@b.com",
      role: "AGENT" as const,
      commune: { id: "c1", name: "Ville", slug: "ville" },
    };
    getMock.mockResolvedValue(staff);

    await expect(getCurrentStaff()).resolves.toEqual(staff);
  });

  it("returns null on a 401 instead of throwing", async () => {
    getMock.mockRejectedValue(new ApiError(401, "Unauthorized"));

    await expect(getCurrentStaff()).resolves.toBeNull();
  });

  it("returns null on a 403 instead of throwing", async () => {
    getMock.mockRejectedValue(new ApiError(403, "Forbidden"));

    await expect(getCurrentStaff()).resolves.toBeNull();
  });

  it("rethrows any other error instead of silently treating it as logged out", async () => {
    getMock.mockRejectedValue(new ApiError(500, "Erreur serveur."));

    await expect(getCurrentStaff()).rejects.toBeInstanceOf(ApiError);
  });

  it("rethrows a non-ApiError failure too", async () => {
    getMock.mockRejectedValue(new Error("boom"));

    await expect(getCurrentStaff()).rejects.toThrow("boom");
  });
});
