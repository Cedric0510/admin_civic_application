import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const updateSettingsMock = vi.fn();
vi.mock("@/app/actions/settings", () => ({
  updateSettings: updateSettingsMock,
}));
const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

const { SettingsForm } = await import("./settings-form");
const { toast } = await import("sonner");

const settings = (
  overrides: Partial<{
    legalNoticeIsCustom: boolean;
    privacyPolicyIsCustom: boolean;
  }> = {},
) => ({
  village_name: "Bessan",
  postal_code: "34550",
  weather: null,
  legal: {
    communeName: "Bessan",
    legalNotice: "## Éditeur\n\nLa commune de Bessan.",
    privacyPolicy: "## Vos droits\n\nContactez la mairie.",
    legalNoticeIsCustom: false,
    privacyPolicyIsCustom: false,
    ...overrides,
  },
});

beforeEach(() => {
  updateSettingsMock.mockReset().mockResolvedValue(undefined);
  refreshMock.mockClear();
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
});

describe("SettingsForm", () => {
  it("shows the commune name and the two legal texts", () => {
    render(<SettingsForm settings={settings()} />);

    expect(screen.getByLabelText("Nom de la commune")).toHaveValue("Bessan");
    expect(screen.getByLabelText("Texte des mentions légales")).toHaveValue(
      "## Éditeur\n\nLa commune de Bessan.",
    );
    expect(
      screen.getByLabelText("Texte de la politique de confidentialité"),
    ).toHaveValue("## Vos droits\n\nContactez la mairie.");
  });

  it("says whether each text is the model or the town hall own", () => {
    render(
      <SettingsForm settings={settings({ privacyPolicyIsCustom: true })} />,
    );

    expect(screen.getByText("Texte modèle")).toBeInTheDocument();
    expect(screen.getByText("Personnalisée")).toBeInTheDocument();
  });

  it("cannot be saved until something changes", () => {
    render(<SettingsForm settings={settings()} />);

    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeDisabled();
  });

  it("sends only the fields that changed, so an untouched model text is never frozen", async () => {
    render(<SettingsForm settings={settings()} />);

    fireEvent.change(
      screen.getByLabelText("Texte de la politique de confidentialité"),
      {
        target: { value: "## Notre politique\n\nTout est chiffré." },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() =>
      expect(updateSettingsMock).toHaveBeenCalledWith({
        privacyPolicy: "## Notre politique\n\nTout est chiffré.",
      }),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(refreshMock).toHaveBeenCalled();
  });

  it("shows the postal code that locates the commune for the weather", () => {
    render(<SettingsForm settings={settings()} />);

    expect(screen.getByLabelText("Code postal")).toHaveValue("34550");
  });

  it("saves a new postal code on its own", async () => {
    render(<SettingsForm settings={settings()} />);

    fireEvent.change(screen.getByLabelText("Code postal"), {
      target: { value: "12260" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() =>
      expect(updateSettingsMock).toHaveBeenCalledWith({ postalCode: "12260" }),
    );
  });

  it("tells where the weather was found after a new postal code is saved", async () => {
    updateSettingsMock.mockResolvedValue({
      status: "ok",
      placeName: "Ambeyrac",
      temperature: 29.4,
      description: "ciel dégagé",
    });
    render(<SettingsForm settings={settings()} />);

    fireEvent.change(screen.getByLabelText("Code postal"), {
      target: { value: "12260" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Météo trouvée : Ambeyrac, 29,4 °C, ciel dégagé.",
      ),
    );
  });

  it("warns when the new postal code finds no weather", async () => {
    updateSettingsMock.mockResolvedValue({ status: "not-found" });
    render(<SettingsForm settings={settings()} />);

    fireEvent.change(screen.getByLabelText("Code postal"), {
      target: { value: "99999" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() =>
      expect(toast.warning).toHaveBeenCalledWith(
        expect.stringContaining("code postal 99999"),
      ),
    );
  });

  it("saves a new commune name on its own, trimmed", async () => {
    render(<SettingsForm settings={settings()} />);

    fireEvent.change(screen.getByLabelText("Nom de la commune"), {
      target: { value: "  Bessan-sur-Mer " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() =>
      expect(updateSettingsMock).toHaveBeenCalledWith({
        name: "Bessan-sur-Mer",
      }),
    );
  });

  it("offers to restore the model only for a text the town hall customised", async () => {
    render(<SettingsForm settings={settings({ legalNoticeIsCustom: true })} />);

    const restore = screen.getAllByRole("button", {
      name: "Rétablir le texte modèle",
    });
    expect(restore).toHaveLength(1);

    fireEvent.click(restore[0]);

    await waitFor(() =>
      expect(updateSettingsMock).toHaveBeenCalledWith({ legalNotice: "" }),
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Texte modèle rétabli."),
    );
  });

  it("shows the reason when saving fails", async () => {
    updateSettingsMock.mockRejectedValue(new Error("Accès refusé."));
    render(<SettingsForm settings={settings()} />);

    fireEvent.change(screen.getByLabelText("Nom de la commune"), {
      target: { value: "Autre" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Accès refusé."),
    );
  });
});
