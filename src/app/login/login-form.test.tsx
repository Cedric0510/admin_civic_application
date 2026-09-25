import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const loginMock = vi.fn();
vi.mock("@/app/actions/auth", () => ({ login: loginMock }));

const { LoginForm } = await import("./login-form");
const { default: LoginPage } = await import("./page");

afterEach(() => vi.restoreAllMocks());

describe("LoginForm", () => {
  it("offers a forgotten-password link next to the password field", () => {
    render(<LoginForm notice={null} />);

    expect(
      screen.getByRole("link", { name: "Mot de passe oublié ?" }),
    ).toHaveAttribute("href", "/forgot-password");
  });

  it("shows the notice it is given, and none otherwise", () => {
    const { unmount } = render(
      <LoginForm notice={{ tone: "success", text: "Mot de passe modifié." }} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Mot de passe modifié.",
    );
    unmount();

    render(<LoginForm notice={null} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("raises an alert for an error notice", () => {
    render(<LoginForm notice={{ tone: "error", text: "Accès suspendu." }} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Accès suspendu.");
  });

  it("keeps the typed address, but not the password, after a failed attempt, without any React warning", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    loginMock.mockResolvedValue({ error: "Identifiants incorrects." });
    render(<LoginForm notice={null} />);

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
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("still asks for both credentials", () => {
    render(<LoginForm notice={null} />);

    expect(screen.getByLabelText("Adresse e-mail")).toBeRequired();
    expect(screen.getByLabelText("Mot de passe")).toBeRequired();
  });
});

describe("LoginPage", () => {
  const show = async (params: { reset?: string; reason?: string }) =>
    render(await LoginPage({ searchParams: Promise.resolve(params) }));

  it("explains that the commune access is suspended", async () => {
    await show({ reason: "suspended" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "L'accès de votre commune est suspendu. Contactez City-Co.",
    );
  });

  it("explains that the session expired", async () => {
    await show({ reason: "expired" });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Votre session a expiré",
    );
  });

  it("confirms a password change after a reset", async () => {
    await show({ reset: "1" });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Votre mot de passe a été modifié",
    );
  });

  it("shows nothing special for an unknown reason or a plain visit", async () => {
    await show({ reason: "whatever" });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
