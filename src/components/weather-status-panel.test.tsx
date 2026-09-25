import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WeatherRefreshResult, WeatherSnapshot } from "@/lib/types";

const refreshRouterMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshRouterMock }),
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

const { WeatherStatusPanel } = await import("./weather-status-panel");
const { toast } = await import("sonner");

const snapshot: WeatherSnapshot = {
  placeName: "Ambeyrac",
  temperature: 29.4,
  description: "ciel dégagé",
  updatedAt: "2026-09-25T15:00:00.000Z",
};

const ok: WeatherRefreshResult = {
  status: "ok",
  placeName: "Ambeyrac",
  temperature: 29.4,
  description: "ciel dégagé",
};

beforeEach(() => {
  refreshRouterMock.mockClear();
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.warning).mockClear();
  vi.mocked(toast.error).mockClear();
});

describe("WeatherStatusPanel", () => {
  it("shows the weather found, the place it was found at and when", () => {
    render(
      <WeatherStatusPanel
        postalCode="12260"
        snapshot={snapshot}
        refresh={vi.fn()}
      />,
    );

    expect(screen.getByText("Météo disponible")).toBeInTheDocument();
    expect(screen.getByText(/29,4 °C, ciel dégagé/)).toBeInTheDocument();
    expect(
      screen.getByText(/Lieu trouvé : Ambeyrac \(code postal 12260\)/),
    ).toBeInTheDocument();
  });

  it("says the commune has no weather and blames the postal code when there is one", () => {
    render(
      <WeatherStatusPanel
        postalCode="97400"
        snapshot={null}
        refresh={vi.fn()}
      />,
    );

    expect(screen.getByText("Aucune météo")).toBeInTheDocument();
    expect(screen.getByText(/code postal 97400/)).toBeInTheDocument();
  });

  it("warns about a lookup by name when the commune has no postal code", () => {
    render(
      <WeatherStatusPanel
        postalCode={null}
        snapshot={null}
        refresh={vi.fn()}
      />,
    );

    expect(screen.getByText(/cherchée par son nom/)).toBeInTheDocument();
  });

  it("refreshes on demand, reports the result and reloads the page", async () => {
    const refresh = vi.fn().mockResolvedValue(ok);
    render(
      <WeatherStatusPanel
        postalCode="12260"
        snapshot={null}
        refresh={refresh}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Rafraîchir la météo" }),
    );

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Météo trouvée : Ambeyrac, 29,4 °C, ciel dégagé.",
      ),
    );
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refreshRouterMock).toHaveBeenCalled();
  });

  it("warns when the refresh finds nothing", async () => {
    render(
      <WeatherStatusPanel
        postalCode="99999"
        snapshot={null}
        refresh={vi.fn().mockResolvedValue({ status: "not-found" })}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Rafraîchir la météo" }),
    );

    await waitFor(() =>
      expect(toast.warning).toHaveBeenCalledWith(
        expect.stringContaining("code postal 99999"),
      ),
    );
  });

  it("shows the reason when the refresh itself fails", async () => {
    render(
      <WeatherStatusPanel
        postalCode="12260"
        snapshot={snapshot}
        refresh={vi.fn().mockRejectedValue(new Error("Accès refusé."))}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Rafraîchir la météo" }),
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Accès refusé."),
    );
  });
});
