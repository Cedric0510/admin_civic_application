import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Report } from "@/lib/types";

vi.mock("@/app/actions/reports", () => ({ updateReportStatus: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { ReportsTable } = await import("./reports-table");

const report = (overrides: Partial<Report> = {}): Report => ({
  id: "report-1",
  category: "VOIRIE",
  address: "12 rue du Coq",
  description: "Nid-de-poule profond devant l'école.",
  imageUrl: null,
  status: "NOUVEAU",
  createdAt: "2026-09-25T12:52:00.000Z",
  citizen: { email: "habitant@bessan.fr" },
  ...overrides,
});

describe("ReportsTable", () => {
  it("shows a clickable thumbnail of the photo when the report has one", () => {
    render(
      <ReportsTable
        reports={[
          report({ imageUrl: "http://localhost:4000/uploads/photo.jpg" }),
        ]}
      />,
    );

    const link = screen.getByRole("link", {
      name: "Voir la photo du signalement : 12 rue du Coq",
    });
    expect(link).toHaveAttribute(
      "href",
      "http://localhost:4000/uploads/photo.jpg",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(
      within(link).getByRole("presentation", { hidden: true }),
    ).toHaveAttribute("src", "http://localhost:4000/uploads/photo.jpg");
  });

  it("shows a dash instead of a thumbnail when there is no photo", () => {
    render(<ReportsTable reports={[report()]} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("gathers what the town hall needs to read on one line of the table", () => {
    render(<ReportsTable reports={[report()]} />);

    expect(screen.getByText("12 rue du Coq")).toBeInTheDocument();
    expect(
      screen.getByText("Nid-de-poule profond devant l'école."),
    ).toBeInTheDocument();
    expect(screen.getByText("habitant@bessan.fr")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Statut du signalement : 12 rue du Coq"),
    ).toHaveValue("NOUVEAU");
  });

  it("labels each cell so the row reads as a card on a small screen", () => {
    const { container } = render(<ReportsTable reports={[report()]} />);

    const labels = Array.from(
      container.querySelectorAll("tbody td[data-label]"),
    ).map((cell) => cell.getAttribute("data-label"));
    expect(labels).toEqual(["Photo", "Signalement", "Habitant", "Statut"]);
  });

  it("explains what to expect when nobody reported anything yet", () => {
    render(<ReportsTable reports={[]} />);

    expect(screen.getByText("Aucun signalement")).toBeInTheDocument();
  });
});
