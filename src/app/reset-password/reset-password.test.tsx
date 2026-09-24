import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const resetMock = vi.fn();
vi.mock("@/app/actions/auth", () => ({ resetPassword: resetMock }));

const { ResetPasswordForm } = await import("./reset-password-form");
const { default: ResetPasswordPage, metadata } = await import("./page");

beforeEach(() => resetMock.mockReset());

describe("ResetPasswordForm", () => {
  it("carries the link token along without showing it", () => {
    const { container } = render(<ResetPasswordForm token="abc123" />);

    const hidden = container.querySelector<HTMLInputElement>(
      'input[name="token"]',
    );
    expect(hidden).toHaveAttribute("type", "hidden");
    expect(hidden?.value).toBe("abc123");
  });

  it("asks twice for a password of at least 8 characters", () => {
    render(<ResetPasswordForm token="abc123" />);

    for (const label of ["Nouveau mot de passe", "Confirmer le mot de passe"]) {
      const field = screen.getByLabelText(label);
      expect(field).toBeRequired();
      expect(field).toHaveAttribute("minlength", "8");
      expect(field).toHaveAttribute("autocomplete", "new-password");
    }
  });

  it("shows what the server refused and offers a new link", async () => {
    resetMock.mockResolvedValue({
      error: "Ce lien est invalide ou a expiré. Demandez-en un nouveau.",
    });
    render(<ResetPasswordForm token="abc123" />);

    fireEvent.change(screen.getByLabelText("Nouveau mot de passe"), {
      target: { value: "NouveauMotDePasse2" },
    });
    fireEvent.change(screen.getByLabelText("Confirmer le mot de passe"), {
      target: { value: "NouveauMotDePasse2" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer le mot de passe" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "invalide ou a expiré",
    );
    expect(
      screen.getByRole("link", { name: "Demander un nouveau lien" }),
    ).toHaveAttribute("href", "/forgot-password");
    const data = resetMock.mock.calls[0][0] as FormData;
    expect(data.get("token")).toBe("abc123");
  });
});

describe("ResetPasswordPage", () => {
  it("shows the form when the link carries a token", async () => {
    render(
      await ResetPasswordPage({
        searchParams: Promise.resolve({ token: "abc123" }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Nouveau mot de passe" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nouveau mot de passe")).toBeInTheDocument();
  });

  it("explains, and offers a new link, when the token is missing", async () => {
    render(await ResetPasswordPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("alert")).toHaveTextContent("Ce lien est incomplet");
    expect(
      screen.getByRole("link", { name: "Demander un nouveau lien" }),
    ).toHaveAttribute("href", "/forgot-password");
    expect(screen.queryByLabelText("Nouveau mot de passe")).not.toBeInTheDocument();
  });

  it("keeps the token out of the Referer header sent to other sites", () => {
    expect(metadata.referrer).toBe("no-referrer");
  });
});
