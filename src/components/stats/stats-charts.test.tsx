import { render, screen } from "@testing-library/react";
import { CalendarClock } from "lucide-react";
import { describe, expect, it } from "vitest";
import { BucketBars } from "./bucket-bars";
import { DailyBars } from "./daily-bars";
import { DashboardHero } from "./dashboard-hero";
import { KpiCard } from "./kpi-card";
import { MeterBar } from "./meter-bar";
import { PeriodSelector } from "./period-selector";
import { Ring } from "./ring";
import { SegmentedBar } from "./segmented-bar";
import { Sparkline, sparklinePath } from "./sparkline";

const series = [
  { date: "2026-09-22", count: 0 },
  { date: "2026-09-23", count: 2 },
  { date: "2026-09-24", count: 4 },
];

describe("sparklinePath", () => {
  it("rises with the values and never leaves its box", () => {
    const { line } = sparklinePath([0, 5, 10]);
    const ys = [...line.matchAll(/[ML][\d.]+ ([\d.]+)/g)].map((match) =>
      Number(match[1]),
    );

    expect(ys[0]).toBeGreaterThan(ys[1]);
    expect(ys[1]).toBeGreaterThan(ys[2]);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...ys)).toBeLessThanOrEqual(36);
  });

  it("stays flat, at the bottom, when nothing happened", () => {
    const { line } = sparklinePath([0, 0, 0]);
    const ys = new Set([...line.matchAll(/[ML][\d.]+ ([\d.]+)/g)].map((m) => m[1]));

    expect(ys.size).toBe(1);
  });

  it("copes with a single value", () => {
    expect(sparklinePath([3]).line).toMatch(/^M60\.0 /);
  });

  it("closes the area under the curve", () => {
    expect(sparklinePath([1, 2]).area.endsWith("Z")).toBe(true);
  });
});

describe("Sparkline", () => {
  it("is described for assistive technologies", () => {
    render(<Sparkline values={[1, 2, 3]} label="Lectures par jour" />);

    expect(
      screen.getByRole("img", { name: "Lectures par jour" }),
    ).toBeInTheDocument();
  });

  it("draws nothing without values", () => {
    const { container } = render(<Sparkline values={[]} label="Vide" />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("DailyBars", () => {
  it("describes the whole chart and names the peak day", () => {
    render(<DailyBars series={series} label="Lectures" emptyLabel="Rien" />);

    expect(
      screen.getByRole("img", { name: "Lectures : 6 sur 3 jours" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Pic : 4 le 24/09")).toBeInTheDocument();
    expect(screen.getByText("24/09 · 4")).toBeInTheDocument();
  });

  it("scales bars against the busiest day", () => {
    const { container } = render(
      <DailyBars series={series} label="Lectures" emptyLabel="Rien" />,
    );

    const heights = [...container.querySelectorAll<HTMLElement>("[style]")].map(
      (bar) => bar.style.height,
    );
    expect(heights).toEqual(["2px", "50%", "100%"]);
  });

  it("says so when nothing happened during the period", () => {
    render(
      <DailyBars
        series={series.map((entry) => ({ ...entry, count: 0 }))}
        label="Lectures"
        emptyLabel="Aucune lecture"
      />,
    );

    expect(screen.getByText("Aucune lecture")).toBeInTheDocument();
    expect(screen.queryByText(/Pic/)).not.toBeInTheDocument();
  });

  it("labels the middle of a long period too", () => {
    const long = Array.from({ length: 30 }, (_, index) => ({
      date: `2026-09-${String(index + 1).padStart(2, "0")}`,
      count: index,
    }));
    render(<DailyBars series={long} label="Lectures" emptyLabel="Rien" />);

    expect(screen.getAllByText("16/09").length).toBeGreaterThan(0);
  });

  it("draws nothing without data", () => {
    const { container } = render(
      <DailyBars series={[]} label="Lectures" emptyLabel="Rien" />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe("Ring and MeterBar", () => {
  it("expose their value and never overflow their scale", () => {
    render(
      <>
        <Ring value={140} label="Anneau" />
        <MeterBar value={-5} label="Jauge" />
      </>,
    );

    expect(screen.getByRole("meter", { name: "Anneau" })).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
    expect(screen.getByRole("meter", { name: "Jauge" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("shows what it is given at its centre", () => {
    render(
      <Ring value={40} label="Anneau">
        <span>40 %</span>
      </Ring>,
    );

    expect(screen.getByText("40 %")).toBeInTheDocument();
  });
});

describe("SegmentedBar", () => {
  const segments = [
    { key: "a", label: "Confirmés", value: 6, tone: "good" as const },
    { key: "b", label: "En attente", value: 0, tone: "warn" as const },
    { key: "c", label: "Annulés", value: 2, tone: "neutral" as const },
  ];

  it("sizes each segment by its share, leaving empty ones out of the bar but not out of the legend", () => {
    const { container } = render(
      <SegmentedBar segments={segments} emptyLabel="Rien" />,
    );

    const bar = screen.getByRole("img", {
      name: "Confirmés : 6, En attente : 0, Annulés : 2",
    });
    const grows = [...bar.children].map((child) => (child as HTMLElement).style.flexGrow);
    expect(grows).toEqual(["6", "2"]);
    expect(container).toHaveTextContent("En attente0");
  });

  it("says so, with an empty track, when there is nothing to split", () => {
    render(
      <SegmentedBar
        segments={segments.map((segment) => ({ ...segment, value: 0 }))}
        emptyLabel="Aucune demande"
      />,
    );

    expect(screen.getByText("Aucune demande")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

describe("BucketBars", () => {
  it("spells out every delay class for assistive technologies", () => {
    render(<BucketBars buckets={[4, 3, 2, 1, 0]} />);

    expect(
      screen.getByRole("img", {
        name: "< 1 h : 4, 1 à 4 h : 3, 4 à 24 h : 2, 1 à 3 j : 1, > 3 j : 0",
      }),
    ).toBeInTheDocument();
  });

  it("tolerates a short list of buckets", () => {
    render(<BucketBars buckets={[1]} />);

    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});

describe("KpiCard", () => {
  it("shows the figure with its unit, hint and trend", () => {
    render(
      <KpiCard
        icon={CalendarClock}
        label="Rendez-vous"
        value={1260}
        unit="demandes"
        hint="dont 2 urgentes"
        trend={{ direction: "up", tone: "good", label: "+3 vs 30 j précédents" }}
      />,
    );

    expect(screen.getByText(/^1\s260$/)).toBeInTheDocument();
    expect(screen.getByText("demandes")).toBeInTheDocument();
    expect(screen.getByText("dont 2 urgentes")).toBeInTheDocument();
    expect(screen.getByText("+3 vs 30 j précédents")).toBeInTheDocument();
  });
});

describe("DashboardHero", () => {
  it("greets, dates and summarises", () => {
    render(
      <DashboardHero
        greeting="Bonjour Camille"
        dateLabel="jeudi 24 septembre"
        summary="3 rendez-vous attendent une réponse."
        context="Bessan"
      >
        <span>sélecteur</span>
      </DashboardHero>,
    );

    expect(
      screen.getByRole("heading", { name: "Bonjour Camille" }),
    ).toBeInTheDocument();
    expect(screen.getByText("jeudi 24 septembre")).toBeInTheDocument();
    expect(
      screen.getByText("3 rendez-vous attendent une réponse."),
    ).toBeInTheDocument();
    expect(screen.getByText("Bessan")).toBeInTheDocument();
    expect(screen.getByText("sélecteur")).toBeInTheDocument();
  });
});

describe("PeriodSelector", () => {
  it("offers the three periods and marks the current one", () => {
    render(<PeriodSelector active={30} />);

    expect(screen.getByRole("link", { name: "30 jours" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "7 jours" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("link", { name: "90 jours" })).toHaveAttribute(
      "href",
      "/?period=90",
    );
  });

  it("keeps the same behaviour on a dark background", () => {
    render(<PeriodSelector active={7} onDark />);

    expect(screen.getByRole("link", { name: "7 jours" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});
