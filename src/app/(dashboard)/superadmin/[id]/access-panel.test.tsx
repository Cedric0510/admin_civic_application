import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const setModulesMock = vi.fn();
const setSuspendedMock = vi.fn();
vi.mock("@/app/actions/superadmin", () => ({
  setCommuneModules: setModulesMock,
  setCommuneSuspended: setSuspendedMock,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { ModulesForm } = await import("./modules-form");
const { SuspensionCard } = await import("./suspension-card");
const { toast } = await import("sonner");

beforeEach(() => {
  setModulesMock.mockReset().mockResolvedValue(undefined);
  setSuspendedMock.mockReset().mockResolvedValue(undefined);
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
});

describe("ModulesForm", () => {
  it("shows every module, on unless it is listed as disabled", () => {
    render(<ModulesForm communeId="c1" initialDisabled={["POLLS"]} />);

    expect(screen.getAllByRole("switch")).toHaveLength(7);
    expect(screen.getByRole("switch", { name: "Sondages" })).not.toBeChecked();
    expect(screen.getByRole("switch", { name: "Actualités" })).toBeChecked();
  });

  it("saves the new list when a module is switched off, and confirms", async () => {
    render(<ModulesForm communeId="c1" initialDisabled={[]} />);

    fireEvent.click(screen.getByRole("switch", { name: "Sondages" }));

    await waitFor(() =>
      expect(setModulesMock).toHaveBeenCalledWith("c1", ["POLLS"]),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(screen.getByRole("switch", { name: "Sondages" })).not.toBeChecked();
  });

  it("saves the module back on when it is switched on again", async () => {
    render(<ModulesForm communeId="c1" initialDisabled={["POLLS", "WEATHER"]} />);

    fireEvent.click(screen.getByRole("switch", { name: "Sondages" }));

    await waitFor(() =>
      expect(setModulesMock).toHaveBeenCalledWith("c1", ["WEATHER"]),
    );
  });

  it("switches appointments off together with services, and says why they cannot come back alone", async () => {
    render(<ModulesForm communeId="c1" initialDisabled={[]} />);

    fireEvent.click(screen.getByRole("switch", { name: "Services" }));

    await waitFor(() =>
      expect(setModulesMock).toHaveBeenCalledWith("c1", [
        "SERVICES",
        "APPOINTMENTS",
      ]),
    );
    expect(
      screen.getByRole("switch", { name: "Rendez-vous et agenda" }),
    ).toHaveAttribute("data-disabled");
    expect(screen.getByText(/Nécessite « Services »/)).toBeInTheDocument();
  });

  it("puts the switch back and explains when saving fails", async () => {
    setModulesMock.mockRejectedValue(new Error("Accès refusé."));
    render(<ModulesForm communeId="c1" initialDisabled={[]} />);

    fireEvent.click(screen.getByRole("switch", { name: "Sondages" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Accès refusé."));
    await waitFor(() =>
      expect(screen.getByRole("switch", { name: "Sondages" })).toBeChecked(),
    );
  });
});

describe("SuspensionCard", () => {
  it("shows an active commune and asks for confirmation before suspending", async () => {
    render(<SuspensionCard communeId="c1" communeName="Bessan" suspendedAt={null} />);

    expect(screen.getByText("Accès actif")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Suspendre l'accès" }));

    expect(
      await screen.findByText("Suspendre l'accès de Bessan ?"),
    ).toBeInTheDocument();
    expect(setSuspendedMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Suspendre" }));
    await waitFor(() => expect(setSuspendedMock).toHaveBeenCalledWith("c1", true));
  });

  it("suspends nothing when the confirmation is cancelled", async () => {
    render(<SuspensionCard communeId="c1" communeName="Bessan" suspendedAt={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Suspendre l'accès" }));
    fireEvent.click(await screen.findByRole("button", { name: "Annuler" }));

    await waitFor(() =>
      expect(screen.queryByText("Suspendre l'accès de Bessan ?")).not.toBeInTheDocument(),
    );
    expect(setSuspendedMock).not.toHaveBeenCalled();
  });

  it("shows a suspended commune with its date, and reactivates it in one click", async () => {
    render(
      <SuspensionCard
        communeId="c1"
        communeName="Bessan"
        suspendedAt="2026-09-24T10:00:00.000Z"
      />,
    );

    expect(screen.getByText("Accès suspendu")).toBeInTheDocument();
    expect(screen.getByText(/24\/09\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/habitants continuent/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Réactiver l'accès" }));
    await waitFor(() => expect(setSuspendedMock).toHaveBeenCalledWith("c1", false));
  });

  it("explains a failure", async () => {
    setSuspendedMock.mockRejectedValue(new Error("Réservé au super-administrateur."));
    render(
      <SuspensionCard
        communeId="c1"
        communeName="Bessan"
        suspendedAt="2026-09-24T10:00:00.000Z"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Réactiver l'accès" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Réservé au super-administrateur."),
    );
  });
});
