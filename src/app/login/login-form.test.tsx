import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const loginMock = vi.fn();
vi.mock("@/app/actions/auth", () => ({ login: loginMock }));

const { LoginForm } = await import("./login-form");

describe("LoginForm", () => {
  it("offers a forgotten-password link next to the password field", () => {
    render(<LoginForm passwordChanged={false} />);

    expect(
      screen.getByRole("link", { name: "Mot de passe oublié ?" }),
    ).toHaveAttribute("href", "/forgot-password");
  });

  it("confirms a password change only when coming back from a reset", () => {
    const { unmount } = render(<LoginForm passwordChanged />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Votre mot de passe a été modifié",
    );
    unmount();

    render(<LoginForm passwordChanged={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps the typed address, but not the password, after a failed attempt", async () => {
    loginMock.mockResolvedValue({ error: "Identifiants incorrects." });
    render(<LoginForm passwordChanged={false} />);

    fireEvent.change(screen.getByLabelText("Adresse e-mail"), {
      target: { value: "martine@bessan.fr" },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "MauvaisMotDePasse" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Identifiants incorrects.",
    );
    expect(screen.getByLabelText("Adresse e-mail")).toHaveValue(
      "martine@bessan.fr",
    );
    expect(screen.getByLabelText("Mot de passe")).toHaveValue("");
  });

  it("still asks for both credentials", () => {
    render(<LoginForm passwordChanged={false} />);

    expect(screen.getByLabelText("Adresse e-mail")).toBeRequired();
    expect(screen.getByLabelText("Mot de passe")).toBeRequired();
  });
});
