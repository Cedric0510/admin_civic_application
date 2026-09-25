import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const requestMock = vi.fn();
vi.mock("@/app/actions/auth", () => ({
  requestPasswordReset: requestMock,
}));

const { ForgotPasswordForm } = await import("./forgot-password-form");

function submit(email: string) {
  fireEvent.change(screen.getByLabelText("Adresse e-mail"), {
    target: { value: email },
  });
  fireEvent.click(screen.getByRole("button", { name: "Envoyer le lien" }));
}

beforeEach(() => requestMock.mockReset());
afterEach(() => vi.restoreAllMocks());

describe("ForgotPasswordForm", () => {
  it("asks for the account address and offers a way back to the login page", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText("Adresse e-mail")).toBeRequired();
    expect(
      screen.getByRole("link", { name: "Retour à la connexion" }),
    ).toHaveAttribute("href", "/login");
  });

  it("confirms in neutral words that a link was sent if the account exists", async () => {
    requestMock.mockResolvedValue({ sent: true });
    render(<ForgotPasswordForm />);

    submit("martine@bessan.fr");

    expect(
      await screen.findByText("Vérifiez votre boîte mail"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Si cette adresse correspond à un compte/),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Adresse e-mail")).not.toBeInTheDocument();
    const data = requestMock.mock.calls[0][0] as FormData;
    expect(data.get("email")).toBe("martine@bessan.fr");
  });

  it("shows the error and keeps the form when the request fails, without any React warning", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    requestMock.mockResolvedValue({
      error: "Trop de demandes. Réessayez dans une minute.",
    });
    render(<ForgotPasswordForm />);

    submit("martine@bessan.fr");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Trop de demandes.",
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Adresse e-mail")).toHaveValue(
        "martine@bessan.fr",
      ),
    );
    expect(consoleError).not.toHaveBeenCalled();
  });
});
