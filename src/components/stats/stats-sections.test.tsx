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
import { PollsSection } from "./polls-section";
import { ReportsSection } from "./reports-section";
import { ResidentsSection } from "./residents-section";
import { TodoSection } from "./todo-section";

const now = new Date("2026-09-24T12:00:00Z");

const noAnswer: DelayStats = {
  answered: 0,
  medianMinutes: null,
  meanMinutes: null,
  buckets: [0, 0, 0, 0, 0],
};

const day = (date: string, count: number) => ({ date, count });

const appointments = (
  overrides: Partial<AppointmentStats> = {},
): AppointmentStats => ({
  pending: 3,
  oldestPendingSince: "2026-09-21T12:00:00Z",
  received: { current: 8, previous: 5 },
  receivedByDay: [day("2026-09-23", 3), day("2026-09-24", 5)],
  outcomes: { pending: 2, confirmed: 5, cancelled: 1 },
  responseDelay: {
    current: {
      answered: 4,
      medianMinutes: 90,
      meanMinutes: 200,
      buckets: [1, 1, 1, 1, 0],
    },
    previous: {
      answered: 2,
      medianMinutes: 210,
      meanMinutes: 210,
      buckets: [0, 1, 1, 0, 0],
    },
  },
  ...overrides,
});

const reports = (overrides: Partial<ReportStats> = {}): ReportStats => ({
  backlog: { new: 2, inProgress: 5, oldestNewSince: "2026-09-22T12:00:00Z" },
  received: { current: 9, previous: 9 },
  receivedByDay: [day("2026-09-23", 4), day("2026-09-24", 5)],
  byStatus: { new: 2, inProgress: 3, treated: 4 },
  byCategory: [
    { category: "VOIRIE", count: 6 },
    { category: "ECLAIRAGE", count: 3 },
  ],
  responseDelay: {
    current: {
      answered: 1,
      medianMinutes: 2880,
      meanMinutes: 2880,
      buckets: [0, 0, 0, 1, 0],
    },
    previous: noAnswer,
  },
  ...overrides,
});

describe("TodoSection", () => {
  it("says what is waiting, how urgent it is and where to act", () => {
    render(
      <TodoSection
        appointments={appointments()}
        reports={reports()}
        scope="commune"
        now={now}
      />,
    );

    expect(screen.getByText("Rendez-vous à confirmer")).toBeInTheDocument();
    expect(screen.getByText("demandes")).toBeInTheDocument();
    expect(
      screen.getByText("La plus ancienne attend depuis 3 j"),
    ).toBeInTheDocument();
    expect(screen.getByText("En retard")).toBeInTheDocument();
    expect(screen.getByText("À traiter rapidement")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Voir les rendez-vous/ }),
    ).toHaveAttribute("href", "/appointments");
    expect(
      screen.getByRole("link", { name: /Voir les signalements/ }),
    ).toHaveAttribute("href", "/reports");
  });

  it("splits the report backlog between new and already in progress", () => {
    render(
      <TodoSection
        appointments={appointments()}
        reports={reports()}
        scope="commune"
        now={now}
      />,
    );

    expect(
      screen.getByRole("img", { name: "Nouveaux : 2, Déjà en cours : 5" }),
    ).toBeInTheDocument();
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

    expect(screen.getByText("Vos rendez-vous à confirmer")).toBeInTheDocument();
  });

  it("reassures when nothing is waiting, with no breakdown to read", () => {
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

    expect(screen.getAllByText("Tout est à jour")).toHaveLength(2);
    expect(screen.getAllByText("Rien n'attend de réponse")).toHaveLength(2);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows only the card of the module that is on", () => {
    const { unmount } = render(
      <TodoSection appointments={appointments()} scope="commune" now={now} />,
    );
    expect(screen.getByText("Rendez-vous à confirmer")).toBeInTheDocument();
    expect(
      screen.queryByText("Signalements à prendre en charge"),
    ).not.toBeInTheDocument();
    unmount();

    render(<TodoSection reports={reports()} scope="commune" now={now} />);
    expect(
      screen.getByText("Signalements à prendre en charge"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Rendez-vous à confirmer"),
    ).not.toBeInTheDocument();
  });

  it("shows nothing when both modules are off", () => {
    const { container } = render(<TodoSection scope="commune" now={now} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("keeps a calm tone while the oldest request is recent", () => {
    render(
      <TodoSection
        appointments={appointments({
          pending: 1,
          oldestPendingSince: "2026-09-24T07:00:00Z",
        })}
        reports={reports({
          backlog: { new: 0, inProgress: 2, oldestNewSince: null },
        })}
        scope="commune"
        now={now}
      />,
    );

    expect(screen.getByText("Dans les temps")).toBeInTheDocument();
    expect(screen.getByText("demande")).toBeInTheDocument();
  });
});

describe("ResidentsSection", () => {
  const citizens: CitizenStats = {
    total: 120,
    commercants: 1,
    arrivals: { current: 15, previous: 12 },
    arrivalsByDay: [day("2026-09-24", 15)],
  };

  it("shows the residents, the shopkeepers among them and the arrivals against the previous period", () => {
    render(<ResidentsSection citizens={citizens} days={30} />);

    expect(screen.getByText("Habitants inscrits")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("comptes")).toBeInTheDocument();
    expect(screen.getByText("dont 1 commerçant")).toBeInTheDocument();
    expect(
      screen.getByText("Arrivés ces 30 derniers jours"),
    ).toBeInTheDocument();
    expect(screen.getByText("+3 vs 30 j précédents")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Nouveaux inscrits : 15 sur 1 jours" }),
    ).toBeInTheDocument();
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
    readsByDay: [day("2026-09-24", 40)],
    mostRead: [
      { id: "a", title: "Travaux rue Haute", reads: 25 },
      { id: "b", title: "Fête du village", reads: 1 },
    ],
  };

  it("ranks the most read articles with their read count", () => {
    render(<ArticlesSection articles={articles} days={30} />);

    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Travaux rue Haute");
    expect(items[0]).toHaveTextContent("25 lectures");
    expect(items[1]).toHaveTextContent("1 lecture");
    expect(items[1]).not.toHaveTextContent("1 lectures");
  });

  it("flags a drop in reads", () => {
    render(<ArticlesSection articles={articles} days={30} />);

    expect(screen.getByText("Lectures sur 30 jours")).toBeInTheDocument();
    expect(screen.getByText("-15 vs 30 j précédents")).toBeInTheDocument();
  });

  it("explains what a read is, and says so when there are none", () => {
    render(
      <ArticlesSection
        articles={{
          ...articles,
          reads: { current: 0, previous: 0 },
          readsByDay: [day("2026-09-24", 0)],
          mostRead: [],
        }}
        days={30}
      />,
    );

    expect(
      screen.getByText(
        "Une lecture correspond à un article ouvert dans l'application.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Aucune lecture enregistrée sur cette période."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Aucune lecture sur cette période"),
    ).toBeInTheDocument();
  });
});

describe("PollsSection", () => {
  const poll = (
    overrides: Partial<PollParticipation> = {},
  ): PollParticipation => ({
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
        polls={[
          poll({
            votes: 1,
            eligibleVoters: 1,
            participationRate: 100,
            isActive: false,
          }),
        ]}
      />,
    );

    expect(
      screen.getByText("1 vote sur 1 habitant pouvant voter"),
    ).toBeInTheDocument();
    expect(screen.getByText("Clos")).toBeInTheDocument();
  });

  it("does not invent a rate when nobody can vote yet", () => {
    render(
      <PollsSection
        polls={[
          poll({ participationRate: null, eligibleVoters: 0, votes: 0 }),
        ]}
      />,
    );

    expect(
      screen.getByText("Personne ne peut encore voter dans la commune."),
    ).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "0");
  });

  it("says so when there is no poll", () => {
    render(<PollsSection polls={[]} />);

    expect(
      screen.getByText("Aucun sondage pour le moment."),
    ).toBeInTheDocument();
  });
});

describe("AppointmentsSection", () => {
  it("shows how fast requests are answered, how the answers are spread and what became of the requests", () => {
    render(
      <AppointmentsSection
        appointments={appointments()}
        days={30}
        scope="commune"
      />,
    );

    expect(screen.getByText("75 %")).toBeInTheDocument();
    expect(
      screen.getByText("des demandes ont reçu une réponse en moins de 24 h"),
    ).toBeInTheDocument();
    expect(screen.getByText("1 h 30")).toBeInTheDocument();
    expect(
      screen.getByText("en moyenne 3 h 20 · 4 réponses"),
    ).toBeInTheDocument();
    expect(screen.getByText("-2 h vs 30 j précédents")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "< 1 h : 1, 1 à 4 h : 1, 4 à 24 h : 1, 1 à 3 j : 1, > 3 j : 0",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Confirmés : 5, En attente : 2, Annulés : 1",
      }),
    ).toBeInTheDocument();
  });

  it("shows the volume received against the previous period, with its daily curve", () => {
    render(
      <AppointmentsSection
        appointments={appointments()}
        days={30}
        scope="commune"
      />,
    );

    expect(screen.getByText("+3 vs 30 j précédents")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Demandes reçues par jour" }),
    ).toBeInTheDocument();
  });

  it("says so when nothing was answered, without a made-up figure, trend or distribution", () => {
    render(
      <AppointmentsSection
        appointments={appointments({
          received: { current: 5, previous: 5 },
          outcomes: { pending: 0, confirmed: 0, cancelled: 0 },
          responseDelay: { current: noAnswer, previous: noAnswer },
        })}
        days={7}
        scope="commune"
      />,
    );

    expect(
      screen.getByText("Aucune réponse sur cette période."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(2);
    expect(screen.getAllByText(/vs 7 j précédents/)).toHaveLength(1);
    expect(
      screen.queryByRole("img", { name: /< 1 h/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Aucune demande reçue sur cette période."),
    ).toBeInTheDocument();
  });

  it("tells an agent the figures only concern their own appointments", () => {
    render(
      <AppointmentsSection
        appointments={appointments()}
        days={30}
        scope="agent"
      />,
    );

    expect(screen.getByText(/qui vous sont attribués/)).toBeInTheDocument();
  });
});

describe("ReportsSection", () => {
  it("lists the categories in French, with their counts", () => {
    render(<ReportsSection reports={reports()} days={30} />);

    expect(screen.getByRole("meter", { name: "Voirie : 6" })).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
    expect(
      screen.getByRole("meter", { name: "Éclairage : 3" }),
    ).toHaveAttribute("aria-valuenow", "50");
  });

  it("tells where the reports received stand", () => {
    render(<ReportsSection reports={reports()} days={30} />);

    expect(
      screen.getByRole("img", {
        name: "Nouveaux : 2, En cours : 3, Traités : 4",
      }),
    ).toBeInTheDocument();
  });

  it("shows the delay before a report is taken care of, even when none was quick", () => {
    render(<ReportsSection reports={reports()} days={30} />);

    expect(screen.getByText("2 j")).toBeInTheDocument();
    expect(screen.getByText("0 %")).toBeInTheDocument();
    expect(screen.getByText("en moyenne 2 j · 1 réponse")).toBeInTheDocument();
  });

  it("says so when there is nothing to show", () => {
    render(
      <ReportsSection
        reports={reports({
          byCategory: [],
          received: { current: 0, previous: 0 },
          byStatus: { new: 0, inProgress: 0, treated: 0 },
          responseDelay: { current: noAnswer, previous: noAnswer },
        })}
        days={30}
      />,
    );

    expect(
      screen.getByText("Aucun signalement sur cette période."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Aucun signalement reçu sur cette période."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Aucune réponse sur cette période."),
    ).toBeInTheDocument();
  });
});
