import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CurrentStaff } from "@/lib/session";
import { Sidebar } from "./sidebar";

vi.mock("next/navigation", () => ({ usePathname: () => "/articles" }));
vi.mock("@/app/actions/auth", () => ({ logout: vi.fn() }));
vi.mock("@/app/actions/superadmin", () => ({ stopManagingCommune: vi.fn() }));

const staff = (
  role: CurrentStaff["role"],
  overrides: Partial<CurrentStaff> = {},
): CurrentStaff => ({
  id: "staff-1",
  name: "Camille Dubois",
  email: "camille@bessan.fr",
  role,
  commune: { id: "c1", name: "Bessan", slug: "bessan", disabledModules: [] },
  ...overrides,
});

describe("Sidebar", () => {
  it("shows an agent the content and citizen menus but not the administration", () => {
    render(<Sidebar staff={staff("AGENT")} managedCommune={null} />);

    expect(screen.getByRole("link", { name: "Tableau de bord" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Signalements" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Agents" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Paramètres" })).not.toBeInTheDocument();
    expect(screen.queryByText("Administration")).not.toBeInTheDocument();
  });

  it("adds agents and settings for an administrator, and communes for a super-administrator", () => {
    const { unmount } = render(
      <Sidebar staff={staff("ADMINISTRATEUR")} managedCommune={null} />,
    );
    expect(screen.getByRole("link", { name: "Agents" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Paramètres" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Communes" })).not.toBeInTheDocument();
    unmount();

    render(<Sidebar staff={staff("SUPER_ADMIN", { commune: null })} managedCommune={null} />);
    expect(screen.getByRole("link", { name: "Communes" })).toBeInTheDocument();
  });

  it("hides the entries of the modules switched off for the commune, and the groups left empty", () => {
    render(
      <Sidebar
        staff={staff("ADMINISTRATEUR", {
          commune: {
            id: "c1",
            name: "Bessan",
            slug: "bessan",
            disabledModules: ["POLLS", "APPOINTMENTS"],
          },
        })}
        managedCommune={null}
      />,
    );

    expect(screen.queryByRole("link", { name: "Sondages" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Rendez-vous" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Agenda" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Actualités" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Signalements" })).toBeInTheDocument();
  });

  it("drops a whole group when all its modules are off", () => {
    render(
      <Sidebar
        staff={staff("AGENT", {
          commune: {
            id: "c1",
            name: "Bessan",
            slug: "bessan",
            disabledModules: ["APPOINTMENTS", "REPORTS"],
          },
        })}
        managedCommune={null}
      />,
    );

    expect(screen.queryByText("Habitants")).not.toBeInTheDocument();
    expect(screen.getByText("Contenus")).toBeInTheDocument();
  });

  it("follows the commune a super-administrator is managing rather than none", () => {
    render(
      <Sidebar
        staff={staff("SUPER_ADMIN", { commune: null })}
        managedCommune={{
          id: "c2",
          name: "Saint-Martin",
          slug: "saint-martin",
          disabledModules: ["COMMERCES"],
        }}
      />,
    );

    expect(screen.queryByRole("link", { name: "Commerçants" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Services" })).toBeInTheDocument();
  });

  it("marks the page being viewed", () => {
    render(<Sidebar staff={staff("ADMINISTRATEUR")} managedCommune={null} />);

    expect(screen.getByRole("link", { name: "Actualités" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Sondages" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(
      screen.getByRole("link", { name: "Tableau de bord" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("shows who is connected, with their role and commune", () => {
    render(<Sidebar staff={staff("ADMINISTRATEUR")} managedCommune={null} />);

    expect(screen.getByText("Camille Dubois")).toBeInTheDocument();
    expect(screen.getByText("Administrateur")).toBeInTheDocument();
    expect(screen.getByText("CD")).toBeInTheDocument();
    expect(screen.getByText("Bessan")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Se déconnecter" })).toBeInTheDocument();
  });

  it("flags a super-administrator managing a commune remotely", () => {
    render(
      <Sidebar
        staff={staff("SUPER_ADMIN", { commune: null })}
        managedCommune={{
          id: "c2",
          name: "Saint-Martin",
          slug: "saint-martin",
          disabledModules: [],
        }}
      />,
    );

    expect(screen.getByText("Gestion à distance")).toBeInTheDocument();
    expect(screen.getByText("Saint-Martin")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quitter" })).toBeInTheDocument();
  });

  it("opens the menu as a drawer on small screens and closes it after a choice", () => {
    render(<Sidebar staff={staff("AGENT")} managedCommune={null} />);
    expect(screen.getAllByRole("link", { name: "Actualités" })).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
    const links = screen.getAllByRole("link", { name: "Actualités" });
    expect(links).toHaveLength(2);

    fireEvent.click(links[0]);
    expect(screen.getAllByRole("link", { name: "Actualités" })).toHaveLength(1);
  });

  it("closes the drawer from its close button", () => {
    render(<Sidebar staff={staff("AGENT")} managedCommune={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Fermer le menu" })[0]);

    expect(screen.getAllByRole("link", { name: "Actualités" })).toHaveLength(1);
  });
});
