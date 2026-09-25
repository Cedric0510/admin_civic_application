import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const provisionMock = vi.fn();
vi.mock("@/app/actions/superadmin", () => ({
  provisionCommune: provisionMock,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { CommuneProvisionForm } = await import("./commune-provision-form");
const { toast } = await import("sonner");

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillEverything(overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    "Identifiant (slug) *": "bessan",
    "Code postal": "34550",
    "Email *": "mairie@bessan.fr",
    "Confirmer l'email *": "mairie@bessan.fr",
    "Mot de passe *": "Un-mot-de-passe",
    "Confirmer le mot de passe *": "Un-mot-de-passe",
    ...overrides,
  };
  Object.entries(values).forEach(([label, value]) => fill(label, value));
  const [communeName, adminName] = screen.getAllByLabelText("Nom *");
  fireEvent.change(communeName, { target: { value: "Bessan" } });
  fireEvent.change(adminName, { target: { value: "Marie Durand" } });
}

beforeEach(() => {
  provisionMock.mockReset().mockResolvedValue(undefined);
  vi.mocked(toast.error).mockClear();
});

describe("CommuneProvisionForm", () => {
  it("provisions the commune when the administrator credentials are confirmed", async () => {
    render(<CommuneProvisionForm />);

    fillEverything();
    fireEvent.click(screen.getByRole("button", { name: "Provisionner" }));

    await waitFor(() => expect(provisionMock).toHaveBeenCalledTimes(1));
    const data = provisionMock.mock.calls[0][0] as FormData;
    expect(data.get("adminEmail")).toBe("mairie@bessan.fr");
    expect(data.get("adminPassword")).toBe("Un-mot-de-passe");
  });

  it("sends the postal code that locates the commune for the weather", async () => {
    render(<CommuneProvisionForm />);

    fillEverything({ "Code postal": "12260" });
    fireEvent.click(screen.getByRole("button", { name: "Provisionner" }));

    await waitFor(() => expect(provisionMock).toHaveBeenCalledTimes(1));
    const data = provisionMock.mock.calls[0][0] as FormData;
    expect(data.get("communePostalCode")).toBe("12260");
  });

  it("creates neither the commune nor the account when the passwords differ", async () => {
    render(<CommuneProvisionForm />);

    fillEverything({ "Confirmer le mot de passe *": "Autre-chose-12" });
    fireEvent.click(screen.getByRole("button", { name: "Provisionner" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Les deux mots de passe ne sont pas identiques.",
      ),
    );
    expect(provisionMock).not.toHaveBeenCalled();
  });

  it("creates neither the commune nor the account when the e-mail addresses differ", async () => {
    render(<CommuneProvisionForm />);

    fillEverything({ "Confirmer l'email *": "mairie@bessa.fr" });
    fireEvent.click(screen.getByRole("button", { name: "Provisionner" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Les deux adresses e-mail ne sont pas identiques.",
      ),
    );
    expect(provisionMock).not.toHaveBeenCalled();
  });
});
