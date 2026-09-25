import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeedbackList } from "./feedback-list";
import { FeedbackSummaryCards } from "./feedback-summary";
import { formatAverage } from "./feedback-labels";

const items = [
  {
    id: "f1",
    kind: "IDEE" as const,
    rating: 5,
    message: "Un agenda serait top",
    createdAt: "2026-09-25T09:00:00.000Z",
    communeName: "Bessan",
    contactEmail: "martine@example.fr",
  },
  {
    id: "f2",
    kind: "PROBLEME" as const,
    rating: 2,
    message: "Le vote plante",
    createdAt: "2026-09-24T09:00:00.000Z",
    communeName: "Bessan",
    contactEmail: null,
  },
];

describe("FeedbackList", () => {
  it("says so when nobody has written yet", () => {
    render(<FeedbackList items={[]} showCommune={false} />);

    expect(screen.getByText("Aucun avis pour l'instant")).toBeInTheDocument();
  });

  it("shows each opinion with its message, kind and a rating read aloud as a whole", () => {
    render(<FeedbackList items={items} showCommune={false} />);

    expect(screen.getByText("Un agenda serait top")).toBeInTheDocument();
    expect(screen.getByText("Le vote plante")).toBeInTheDocument();
    expect(screen.getByText("Idée")).toBeInTheDocument();
    expect(screen.getByText("Problème")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "5 sur 5" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "2 sur 5" })).toBeInTheDocument();
  });

  it("offers to answer only the residents who agreed to be contacted", () => {
    render(<FeedbackList items={items} showCommune={false} />);

    expect(
      screen.getByRole("link", { name: "Répondre à martine@example.fr" }),
    ).toHaveAttribute("href", "mailto:martine@example.fr");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("names the commune only for a super-administrator who sees several", () => {
    const { rerender } = render(<FeedbackList items={items} showCommune={false} />);
    expect(screen.queryByText("Bessan")).not.toBeInTheDocument();

    rerender(<FeedbackList items={items} showCommune />);
    expect(screen.getAllByText("Bessan")).toHaveLength(2);
  });
});

describe("FeedbackSummaryCards", () => {
  it("shows the total, the average with a decimal comma, and the split by kind", () => {
    render(
      <FeedbackSummaryCards
        summary={{
          total: 4,
          average: 3.75,
          byKind: { PROBLEME: 1, IDEE: 3, AUTRE: 0 },
        }}
      />,
    );

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("3,8")).toBeInTheDocument();
    expect(screen.getByText("Problème · 1")).toBeInTheDocument();
    expect(screen.getByText("Idée · 3")).toBeInTheDocument();
    expect(screen.getByText("Autre · 0")).toBeInTheDocument();
  });

  it("shows a dash rather than a made-up average when there is no opinion yet", () => {
    render(
      <FeedbackSummaryCards
        summary={{
          total: 0,
          average: null,
          byKind: { PROBLEME: 0, IDEE: 0, AUTRE: 0 },
        }}
      />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("formatAverage", () => {
  it("rounds to one decimal, in French", () => {
    expect(formatAverage(4)).toBe("4,0");
    expect(formatAverage(3.66)).toBe("3,7");
    expect(formatAverage(null)).toBe("—");
  });
});
