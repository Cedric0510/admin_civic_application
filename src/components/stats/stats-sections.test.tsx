import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  AppointmentStats,
  ArticleStats,
  CitizenStats,
  DelayStats,
  PollParticipation,
  ReportStats,
} from "@/lib/types";
import { AppointmentsSection } from "./appointments-section";
import { ArticlesSection } from "./articles-section";
import { DailyBars } from "./daily-bars";
import { MeterBar } from "./meter-bar";
import { PeriodSelector } from "./period-selector";
import { PollsSection } from "./polls-section";
import { ReportsSection } from "./reports-section";
import { ResidentsSection } from "./residents-section";
import { StatCard } from "./stat-card";
import { TodoSection } from "./todo-section";
import { CalendarClock } from "lucide-react";

const now = new Date("2026-09-24T12:00:00Z");

const noAnswer: DelayStats = {
  answered: 0,
  medianMinutes: null,
  meanMinutes: null,
};

const appointments = (overrides: Partial<AppointmentStats> = {}): AppointmentStats => ({
  pending: 3,
  oldestPendingSince: "2026-09-21T12:00:00Z",
  received: { current: 8, previous: 5 },
  responseDelay: {
    current: { answered: 4, medianMinutes: 90, meanMinutes: 200 },
    previous: { answered: 2, medianMinutes: 210, meanMinutes: 210 },
  },
  ...overrides,
});

const reports = (overrides: Partial<ReportStats> = {}): ReportStats => ({
  backlog: { new: 2, inProgress: 5, oldestNewSince: "2026-09-22T12:00:00Z" },
  received: { current: 9, previous: 9 },
  byCategory: [
    { category: "VOIRIE", count: 6 },
    { category: "ECLAIRAGE", count: 3 },
  ],
  responseDelay: {
    current: { answered: 1, medianMinutes: 2880, meanMinutes: 2880 },
    previous: noAnswer,
  },
  ...overrides,
});

describe("DailyBars", () => {
  const series = [
    { date: "2026-09-22", count: 0 },
    { date: "2026-09-23", count: 2 },
    { date: "2026-09-24", count: 4 },
  ];

  it("describes the whole chart for assistive technologies and each day on hover", () => {
    render(<DailyBars series={series} label="Lectures" emptyLabel="Rien" />);

    expect(
      screen.getByRole("img", { name: "Lectures : 6 sur 3 jours" }),
    ).toBeInTheDocument();
    expect(screen.getByTitle("24/09 : 4")).toBeInTheDocument();
    expect(screen.getByTitle("22/09 : 0")).toBeInTheDocument();
  });

  it("scales bars against the busiest day", () => {
    render(<DailyBars series={series} label="Lectures" emptyLabel="Rien" />);

    expect(screen.getByTitle("24/09 : 4")).toHaveStyle({ height: "100%" });
    expect(screen.getByTitle("23/09 : 2")).toHaveStyle({ height: "50%" });
  });

  it("says so when nothing happened during the period", () => {
    render(
      <DailyBars
        series={series.map((day) => ({ ...day, count: 0 }))}
        label="Lectures"
        emptyLabel="Aucune lecture"
      />,
    );

    expect(screen.getByText("Aucune lecture")).toBeInTheDocument();
  });

  it("draws nothing without data", () => {
    const { container } = render(
      <DailyBars series={[]} label="Lectures" emptyLabel="Rien" />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe("MeterBar", () => {
  it("exposes its value and never overflows its track", () => {
    render(<MeterBar value={140} label="Participation" />);

    expect(screen.getByRole("meter", { name: "Participation" })).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });
});

describe("StatCard", () => {
  it("shows the figure with its caption and trend, and links when asked", () => {
    render(
      <StatCard
        icon={CalendarClock}
        label="Rendez-vous"
        value={12}
        caption="dont 2 urgents"
        trend={{ direction: "up", tone: "good", label: "+3 vs 30 j précédents" }}
        href="/appointments"
      />,
    );

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("dont 2 urgents")).toBeInTheDocument();
    expect(screen.getByText("+3 vs 30 j précédents")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/appointments");
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
});

describe("TodoSection", () => {
  it("shows what is waiting and for how long", () => {
    render(
      <TodoSection
        appointments={appointments()}
        reports={reports()}
        scope="commune"
        now={now}
      />,
    );

    expect(screen.getByText("Rendez-vous en attente")).toBeInTheDocument();
    expect(screen.getByText("Le plus ancien attend 3 j")).toBeInTheDocument();
    expect(screen.getByText("5 en cours · le plus ancien attend 2 j")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Rendez-vous en attente/ }),
    ).toHaveAttribute("href", "/appointments");
    expect(
      screen.getByRole("link", { name: /Signalements nouveaux/ }),
    ).toHaveAttribute("href", "/reports");
  });

  it("speaks to the agent about their own appointments", () => {
    render(
      <TodoSection
        appointments={appointments()}
        reports={reports()}
        scope="agent"
        now={now}
      />,
    );

    expect(screen.getByText("Vos rendez-vous en attente")).toBeInTheDocument();
  });

  it("reassures when nothing is waiting", () => {
    render(
      <TodoSection
        appointments={appointments({ pending: 0, oldestPendingSince: null })}
        reports={reports({
          backlog: { new: 0, inProgress: 0, oldestNewSince: null },
        })}
        scope="commune"
        now={now}
      />,
    );

    expect(screen.getByText("Aucune demande en attente")).toBeInTheDocument();
    expect(screen.getByText("0 en cours")).toBeInTheDocument();
  });
});

describe("ResidentsSection", () => {
  const citizens: CitizenStats = {
    total: 120,
    commercants: 1,
    arrivals: { current: 15, previous: 12 },
    arrivalsByDay: [{ date: "2026-09-24", count: 15 }],
  };

  it("shows the residents, the shopkeepers among them and the arrivals against the previous period", () => {
    render(<ResidentsSection citizens={citizens} days={30} />);

    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("dont 1 commerçant")).toBeInTheDocument();
    expect(screen.getByText("Nouveaux inscrits (30 j)")).toBeInTheDocument();
    expect(screen.getByText("+3 vs 30 j précédents")).toBeInTheDocument();
  });

  it("does not mention shopkeepers when there are none", () => {
    render(
      <ResidentsSection citizens={{ ...citizens, commercants: 0 }} days={7} />,
    );

    expect(screen.queryByText(/commerçant/)).not.toBeInTheDocument();
  });
});

describe("ArticlesSection", () => {
  const articles: ArticleStats = {
    published: 9,
    reads: { current: 40, previous: 55 },
    readsByDay: [{ date: "2026-09-24", count: 40 }],
    mostRead: [
      { id: "a", title: "Travaux rue Haute", reads: 25 },
      { id: "b", title: "Fête du village", reads: 1 },
    ],
  };

  it("ranks the most read articles with their read count", () => {
    render(<ArticlesSection articles={articles} days={30} />);

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Travaux rue Haute");
    expect(items[0]).toHaveTextContent("25 lectures");
    expect(items[1]).toHaveTextContent("1 lecture");
    expect(items[1]).not.toHaveTextContent("1 lectures");
  });

  it("flags a drop in reads", () => {
    render(<ArticlesSection articles={articles} days={30} />);

    expect(screen.getByText("-15 vs 30 j précédents")).toBeInTheDocument();
  });

  it("explains what a read is, and says so when there are none", () => {
    render(
      <ArticlesSection
        articles={{
          ...articles,
          reads: { current: 0, previous: 0 },
          readsByDay: [{ date: "2026-09-24", count: 0 }],
          mostRead: [],
        }}
        days={30}
      />,
    );

    expect(
      screen.getByText("Une lecture correspond à un article ouvert dans l'application."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Aucune lecture enregistrée sur cette période."),
    ).toBeInTheDocument();
  });
});

describe("PollsSection", () => {
  const poll = (overrides: Partial<PollParticipation> = {}): PollParticipation => ({
    id: "p1",
    question: "Faut-il un nouveau parking ?",
    isActive: true,
    closesAt: null,
    votes: 37,
    eligibleVoters: 120,
    participationRate: 31,
    ...overrides,
  });

  it("gives the participation of each poll in plain words", () => {
    render(<PollsSection polls={[poll()]} />);

    expect(screen.getByText("31 %")).toBeInTheDocument();
    expect(
      screen.getByText("37 votes sur 120 habitants pouvant voter"),
    ).toBeInTheDocument();
    expect(screen.getByText("Actif")).toBeInTheDocument();
    expect(
      screen.getByRole("meter", {
        name: "Participation au sondage : Faut-il un nouveau parking ?",
      }),
    ).toHaveAttribute("aria-valuenow", "31");
  });

  it("uses the singular for one vote and marks closed polls", () => {
    render(
      <PollsSection
        polls={[poll({ votes: 1, eligibleVoters: 1, participationRate: 100, isActive: false })]}
      />,
    );

    expect(
      screen.getByText("1 vote sur 1 habitant pouvant voter"),
    ).toBeInTheDocument();
    expect(screen.getByText("Clos")).toBeInTheDocument();
  });

  it("does not invent a rate when nobody can vote yet", () => {
    render(<PollsSection polls={[poll({ participationRate: null, eligibleVoters: 0, votes: 0 })]} />);

    expect(
      screen.getByText("Personne ne peut encore voter dans la commune."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("meter")).not.toBeInTheDocument();
  });

  it("says so when there is no poll", () => {
    render(<PollsSection polls={[]} />);

    expect(screen.getByText("Aucun sondage pour le moment.")).toBeInTheDocument();
  });
});

describe("AppointmentsSection", () => {
  it("shows the usual response delay, the average and the change against the previous period", () => {
    render(
      <AppointmentsSection appointments={appointments()} days={30} scope="commune" />,
    );

    expect(screen.getByText("1 h 30")).toBeInTheDocument();
    expect(
      screen.getByText("4 réponses · en moyenne 3 h 20"),
    ).toBeInTheDocument();
    expect(screen.getByText("-2 h vs 30 j précédents")).toBeInTheDocument();
    expect(screen.getByText("+3 vs 30 j précédents")).toBeInTheDocument();
  });

  it("says so when nothing was answered, without a made-up figure or trend", () => {
    render(
      <AppointmentsSection
        appointments={appointments({
          received: { current: 5, previous: 5 },
          responseDelay: { current: noAnswer, previous: noAnswer },
        })}
        days={7}
        scope="commune"
      />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
    expect(
      screen.getByText("Aucune réponse sur cette période"),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/vs 7 j précédents/)).toHaveLength(1);
  });

  it("tells an agent the figures only concern their own appointments", () => {
    render(
      <AppointmentsSection appointments={appointments()} days={30} scope="agent" />,
    );

    expect(screen.getByText(/qui vous sont attribués/)).toBeInTheDocument();
  });
});

describe("ReportsSection", () => {
  it("lists the categories in French, with their counts", () => {
    render(<ReportsSection reports={reports()} days={30} />);

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Voirie");
    expect(items[0]).toHaveTextContent("6");
    expect(items[1]).toHaveTextContent("Éclairage");
    expect(screen.getByRole("meter", { name: "Voirie : 6" })).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
    expect(screen.getByRole("meter", { name: "Éclairage : 3" })).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
  });

  it("shows the delay before a report is taken care of", () => {
    render(<ReportsSection reports={reports()} days={30} />);

    expect(screen.getByText("2 j")).toBeInTheDocument();
    expect(
      screen.getByText("1 signalement pris en charge · en moyenne 2 j"),
    ).toBeInTheDocument();
  });

  it("says so when there is nothing to show", () => {
    render(
      <ReportsSection
        reports={reports({
          byCategory: [],
          received: { current: 0, previous: 0 },
          responseDelay: { current: noAnswer, previous: noAnswer },
        })}
        days={30}
      />,
    );

    expect(
      screen.getByText("Aucun signalement sur cette période."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Aucune prise en charge sur cette période"),
    ).toBeInTheDocument();
  });
});
