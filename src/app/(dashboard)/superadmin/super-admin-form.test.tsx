import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createSuperAdminMock = vi.fn();
vi.mock("@/app/actions/staff", () => ({
  createSuperAdmin: createSuperAdminMock,
}));
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, back: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { SuperAdminForm } = await import("./super-admin-form");
const { toast } = await import("sonner");

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillEverything(overrides: Record<string, string> = {}) {
  const values = {
    "Nom *": "Cédric Vanhove",
    "Email *": "cedric@city-co.dev",
    "Confirmer l'email *": "cedric@city-co.dev",
    "Mot de passe *": "Un-mot-de-passe-solide",
    "Confirmer le mot de passe *": "Un-mot-de-passe-solide",
    ...overrides,
  };
  Object.entries(values).forEach(([label, value]) => fill(label, value));
}

beforeEach(() => {
  createSuperAdminMock.mockReset().mockResolvedValue(undefined);
  pushMock.mockClear();
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
});

describe("SuperAdminForm", () => {
  it("does not offer a role choice -- every account created here is a super-admin", () => {
    render(<SuperAdminForm />);

    expect(screen.queryByLabelText(/Rôle/)).not.toBeInTheDocument();
  });

  it("creates the account when both confirmations match", async () => {
    render(<SuperAdminForm />);

    fillEverything();
    fireEvent.click(screen.getByRole("button", { name: "Créer" }));

    await waitFor(() => expect(createSuperAdminMock).toHaveBeenCalledTimes(1));
    const data = createSuperAdminMock.mock.calls[0][0] as FormData;
    expect(data.get("email")).toBe("cedric@city-co.dev");
    expect(data.get("password")).toBe("Un-mot-de-passe-solide");
    expect(pushMock).toHaveBeenCalledWith("/superadmin/admins");
  });

  it("tells right away when the two passwords differ, and does not create anything", async () => {
    render(<SuperAdminForm />);

    fillEverything({ "Confirmer le mot de passe *": "Autre-mot-de-passe" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Les deux mots de passe ne sont pas identiques.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Créer" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(createSuperAdminMock).not.toHaveBeenCalled();
  });
});
