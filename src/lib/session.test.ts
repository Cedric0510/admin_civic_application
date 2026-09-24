import { describe, expect, it, vi } from "vitest";

const getMock = vi.fn();
vi.mock("./api/client", async () => {
  const actual = await vi.importActual<typeof import("./api/client")>(
    "./api/client",
  );
  return { ...actual, api: { get: getMock } };
});

const cookieGetMock = vi.fn();
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: cookieGetMock }),
}));

const { getCurrentStaff, getManagedCommune, getStaffSession } = await import(
  "./session"
);
const { ApiError } = await import("./api/client");

describe("getCurrentStaff", () => {
  it("returns the staff profile when the token is valid", async () => {
    const staff = {
      id: "1",
      name: "Alice",
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

describe("getStaffSession", () => {
  it("returns the staff profile when the token is valid", async () => {
    const staff = { id: "1", name: "Alice" };
    getMock.mockResolvedValue(staff);

    await expect(getStaffSession()).resolves.toEqual({ staff });
  });

  it("tells an expired or invalid session from the 401", async () => {
    getMock.mockRejectedValue(new ApiError(401, "Compte introuvable ou supprimé."));

    await expect(getStaffSession()).resolves.toEqual({
      staff: null,
      failure: "expired",
    });
  });

  it("tells a suspended commune from the 403 message, so the login page can explain it", async () => {
    getMock.mockRejectedValue(
      new ApiError(403, "L'accès de votre commune est suspendu. Contactez City-Co."),
    );

    await expect(getStaffSession()).resolves.toEqual({
      staff: null,
      failure: "suspended",
    });
  });

  it("treats any other 403 as an expired session", async () => {
    getMock.mockRejectedValue(new ApiError(403, "Forbidden resource"));

    await expect(getStaffSession()).resolves.toEqual({
      staff: null,
      failure: "expired",
    });
  });

  it("rethrows a server error rather than logging the user out", async () => {
    getMock.mockRejectedValue(new ApiError(500, "Erreur serveur."));

    await expect(getStaffSession()).rejects.toBeInstanceOf(ApiError);
  });
});

describe("getManagedCommune", () => {
  const agent = {
    id: "1",
    name: "Agent",
    email: "agent@ville.fr",
    role: "AGENT" as const,
    commune: { id: "c1", name: "Ville", slug: "ville", disabledModules: [] },
  };
  const superAdminNoPick = {
    id: "2",
    name: "Super",
    email: "super@city-co.dev",
    role: "SUPER_ADMIN" as const,
    commune: null,
  };

  it("returns null with no staff passed and none logged in", async () => {
    getMock.mockRejectedValue(new ApiError(401, "Unauthorized"));

    await expect(getManagedCommune()).resolves.toBeNull();
  });

  it("returns the agent own commune directly, without reading any cookie", async () => {
    await expect(getManagedCommune(agent)).resolves.toEqual(agent.commune);
    expect(cookieGetMock).not.toHaveBeenCalled();
  });

  it("returns null for a super-admin who has not chosen a commune", async () => {
    cookieGetMock.mockReturnValue(undefined);

    await expect(getManagedCommune(superAdminNoPick)).resolves.toBeNull();
  });

  it("resolves the commune a super-admin has chosen via the cookie", async () => {
    cookieGetMock.mockReturnValue({ value: "bessan" });
    const commune = { id: "c2", name: "Bessan", slug: "bessan" };
    getMock.mockResolvedValue(commune);

    await expect(getManagedCommune(superAdminNoPick)).resolves.toEqual(commune);
    expect(getMock).toHaveBeenCalledWith("/communes/bessan");
  });

  it("treats a stale cookie (renamed/deleted commune) as no commune chosen", async () => {
    cookieGetMock.mockReturnValue({ value: "does-not-exist" });
    getMock.mockRejectedValue(new ApiError(404, "Commune introuvable."));

    await expect(getManagedCommune(superAdminNoPick)).resolves.toBeNull();
  });
});
