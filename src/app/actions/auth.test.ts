import { beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();
vi.mock("@/lib/api/client", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api/client")>("@/lib/api/client");
  return { ...actual, api: { post: postMock } };
});

const redirectMock = vi.fn();
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const { requestPasswordReset, resetPassword } = await import("./auth");
const { ApiError } = await import("@/lib/api/client");

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  postMock.mockReset();
  redirectMock.mockReset();
});

describe("requestPasswordReset", () => {
  it("asks the API to send a link to the address, and confirms without saying whether the account exists", async () => {
    postMock.mockResolvedValue(undefined);

    const result = await requestPasswordReset(form({ email: "a@b.fr" }));

    expect(postMock).toHaveBeenCalledWith("/staff/forgot-password", {
      email: "a@b.fr",
    });
    expect(result).toEqual({ sent: true });
  });

  it("asks for a valid address when the API rejects it", async () => {
    postMock.mockRejectedValue(new ApiError(400, "email must be an email"));

    await expect(
      requestPasswordReset(form({ email: "pas-un-email" })),
    ).resolves.toEqual({ error: "Saisissez une adresse e-mail valide." });
  });

  it("tells the user to wait when requests come too fast", async () => {
    postMock.mockRejectedValue(new ApiError(429, "Too Many Requests"));

    await expect(
      requestPasswordReset(form({ email: "a@b.fr" })),
    ).resolves.toEqual({ error: "Trop de demandes. Réessayez dans une minute." });
  });

  it("says the server cannot be reached on any other failure", async () => {
    postMock.mockRejectedValue(new ApiError(0, "Impossible de contacter le serveur."));

    await expect(
      requestPasswordReset(form({ email: "a@b.fr" })),
    ).resolves.toEqual({ error: "Impossible de contacter le serveur." });
  });
});

describe("resetPassword", () => {
  const valid = {
    token: "t".repeat(43),
    password: "NouveauMotDePasse2",
    confirmation: "NouveauMotDePasse2",
  };

  it("refuses a short password without calling the API", async () => {
    const result = await resetPassword(
      form({ ...valid, password: "court", confirmation: "court" }),
    );

    expect(result).toEqual({
      error: "Le mot de passe doit contenir au moins 8 caractères.",
    });
    expect(postMock).not.toHaveBeenCalled();
  });

  it("refuses two different passwords without calling the API", async () => {
    const result = await resetPassword(
      form({ ...valid, confirmation: "AutreMotDePasse3" }),
    );

    expect(result).toEqual({
      error: "Les deux mots de passe ne sont pas identiques.",
    });
    expect(postMock).not.toHaveBeenCalled();
  });

  it("sends the token and the new password, then goes back to the login page with a notice", async () => {
    postMock.mockResolvedValue(undefined);

    await resetPassword(form(valid));

    expect(postMock).toHaveBeenCalledWith("/staff/reset-password", {
      token: valid.token,
      password: valid.password,
    });
    expect(redirectMock).toHaveBeenCalledWith("/login?reset=1");
  });

  it("explains that the link is no longer valid, whatever the API says", async () => {
    postMock.mockRejectedValue(
      new ApiError(400, "token must be longer than or equal to 20 characters"),
    );

    const result = await resetPassword(form(valid));

    expect(result).toEqual({
      error: "Ce lien est invalide ou a expiré. Demandez-en un nouveau.",
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("tells the user to wait after too many attempts", async () => {
    postMock.mockRejectedValue(new ApiError(429, "Too Many Requests"));

    await expect(resetPassword(form(valid))).resolves.toEqual({
      error: "Trop de tentatives. Réessayez dans une minute.",
    });
  });

  it("says the server cannot be reached otherwise", async () => {
    postMock.mockRejectedValue(new ApiError(0, "x"));

    await expect(resetPassword(form(valid))).resolves.toEqual({
      error: "Impossible de contacter le serveur.",
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
