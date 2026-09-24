import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentStaffMock = vi.fn();
const getManagedCommuneMock = vi.fn();
vi.mock("@/lib/session", () => ({
  getCurrentStaff: getCurrentStaffMock,
  getManagedCommune: getManagedCommuneMock,
}));

const { ModuleGate } = await import("./module-gate");

const commune = (disabledModules: string[]) => ({
  id: "c1",
  name: "Bessan",
  slug: "bessan",
  disabledModules,
});

async function show(role: string) {
  getCurrentStaffMock.mockResolvedValue({ id: "s1", role });
  render(
    await ModuleGate({
      module: "POLLS",
      children: <p>Contenu des sondages</p>,
    }),
  );
}

beforeEach(() => {
  getCurrentStaffMock.mockReset();
  getManagedCommuneMock.mockReset();
});

describe("ModuleGate", () => {
  it("shows the page when the module is on", async () => {
    getManagedCommuneMock.mockResolvedValue(commune(["WEATHER"]));

    await show("ADMINISTRATEUR");

    expect(screen.getByText("Contenu des sondages")).toBeInTheDocument();
  });

  it("shows the page when there is no commune to check against", async () => {
    getManagedCommuneMock.mockResolvedValue(null);

    await show("SUPER_ADMIN");

    expect(screen.getByText("Contenu des sondages")).toBeInTheDocument();
  });

  it("replaces the page with an explanation when the module is off, telling staff whom to contact", async () => {
    getManagedCommuneMock.mockResolvedValue(commune(["POLLS"]));

    await show("ADMINISTRATEUR");

    expect(screen.queryByText("Contenu des sondages")).not.toBeInTheDocument();
    expect(screen.getByText("Module désactivé")).toBeInTheDocument();
    expect(screen.getByText(/« Sondages » est désactivé pour Bessan/)).toBeInTheDocument();
    expect(screen.getByText(/Contactez City-Co/)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("offers a super-administrator the way to switch it back on", async () => {
    getManagedCommuneMock.mockResolvedValue(commune(["POLLS"]));

    await show("SUPER_ADMIN");

    expect(screen.getByRole("link", { name: "Gérer les modules" })).toHaveAttribute(
      "href",
      "/superadmin/c1",
    );
    expect(screen.queryByText(/Contactez City-Co/)).not.toBeInTheDocument();
  });
});
