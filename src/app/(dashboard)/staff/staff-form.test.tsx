import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createStaffMock = vi.fn();
vi.mock("@/app/actions/staff", () => ({ createStaff: createStaffMock }));
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, back: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { StaffForm } = await import("./staff-form");
const { toast } = await import("sonner");

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillEverything(overrides: Record<string, string> = {}) {
  const values = {
    "Nom *": "Marie Durand",
    "Email *": "marie@bessan.fr",
    "Confirmer l'email *": "marie@bessan.fr",
    "Mot de passe *": "Un-mot-de-passe",
    "Confirmer le mot de passe *": "Un-mot-de-passe",
    ...overrides,
  };
  Object.entries(values).forEach(([label, value]) => fill(label, value));
}

beforeEach(() => {
  createStaffMock.mockReset().mockResolvedValue(undefined);
  pushMock.mockClear();
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
});

describe("StaffForm", () => {
  it("asks for the e-mail address and the password twice", () => {
    render(<StaffForm />);

    expect(screen.getByLabelText("Confirmer l'email *")).toBeRequired();
    expect(screen.getByLabelText("Confirmer le mot de passe *")).toBeRequired();
  });

  it("creates the account when both confirmations match", async () => {
    render(<StaffForm />);

    fillEverything();
    fireEvent.click(screen.getByRole("button", { name: "Créer" }));

    await waitFor(() => expect(createStaffMock).toHaveBeenCalledTimes(1));
    const data = createStaffMock.mock.calls[0][0] as FormData;
    expect(data.get("email")).toBe("marie@bessan.fr");
    expect(data.get("password")).toBe("Un-mot-de-passe");
    expect(pushMock).toHaveBeenCalledWith("/staff");
  });

  it("tells right away when the two passwords differ, and does not create anything", async () => {
    render(<StaffForm />);

    fillEverything({ "Confirmer le mot de passe *": "Un-mot-de-passe-2" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Les deux mots de passe ne sont pas identiques.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Créer" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(createStaffMock).not.toHaveBeenCalled();
  });

  it("tells right away when the two e-mail addresses differ, and does not create anything", async () => {
    render(<StaffForm />);

    fillEverything({ "Confirmer l'email *": "marie@bessa.fr" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Les deux adresses e-mail ne sont pas identiques.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Créer" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(createStaffMock).not.toHaveBeenCalled();
  });

  it("stops complaining once the confirmation is corrected", () => {
    render(<StaffForm />);
    fillEverything({ "Confirmer le mot de passe *": "Autre" });
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fill("Confirmer le mot de passe *", "Un-mot-de-passe");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
