import { describe, expect, it } from "vitest";
import type { AppointmentStats, ReportStats } from "@/lib/types";
import {
  capitalizeFirst,
  countTrend,
  delayTrend,
  firstName,
  formatDuration,
  formatNumber,
  mergeSeries,
  peakOf,
  pluralize,
  summarySentence,
  urgencyOf,
  waitingDuration,
  waitingMinutes,
  withinDayRate,
} from "./stats-format";
import { parseStatsPeriod } from "./stats";

describe("formatDuration", () => {
  it("speaks in minutes under an hour", () => {
    expect(formatDuration(0.4)).toBe("moins d'1 min");
    expect(formatDuration(1)).toBe("1 min");
    expect(formatDuration(45)).toBe("45 min");
  });

  it("speaks in hours and minutes under a day", () => {
    expect(formatDuration(60)).toBe("1 h");
    expect(formatDuration(90)).toBe("1 h 30");
    expect(formatDuration(125)).toBe("2 h 05");
    expect(formatDuration(1439)).toBe("23 h 59");
  });

  it("speaks in days and hours from one day on", () => {
    expect(formatDuration(1440)).toBe("1 j");
    expect(formatDuration(2880 + 120)).toBe("2 j 2 h");
    expect(formatDuration(30 * 1440)).toBe("30 j");
  });

  it("carries a rounded-up 24 hours into the next day", () => {
    expect(formatDuration(1440 + 23 * 60 + 40)).toBe("2 j");
  });

  it("has a dash when there is nothing to measure", () => {
    expect(formatDuration(null)).toBe("—");
  });
});

describe("waitingDuration", () => {
  const now = new Date("2026-09-24T12:00:00Z");

  it("says how long the oldest item has been waiting", () => {
    expect(waitingDuration("2026-09-21T12:00:00Z", now)).toBe("3 j");
    expect(waitingDuration("2026-09-24T09:30:00Z", now)).toBe("2 h 30");
  });

  it("never claims less than a minute, even for a future timestamp", () => {
    expect(waitingDuration("2026-09-24T12:00:30Z", now)).toBe("1 min");
  });

  it("is null when nothing is waiting", () => {
    expect(waitingDuration(null, now)).toBeNull();
  });
});

describe("countTrend", () => {
  it("is good when a metric that should grow grows", () => {
    expect(countTrend(15, 12, 30)).toEqual({
      direction: "up",
      tone: "good",
      label: "+3 vs 30 j précédents",
    });
  });

  it("is bad when it shrinks", () => {
    expect(countTrend(5, 12, 7)).toEqual({
      direction: "down",
      tone: "bad",
      label: "-7 vs 7 j précédents",
    });
  });

  it("flips the meaning for a metric that should shrink", () => {
    expect(countTrend(2, 6, 30, "down").tone).toBe("good");
    expect(countTrend(9, 6, 30, "down").tone).toBe("bad");
  });

  it("is neutral when nothing changed", () => {
    expect(countTrend(4, 4, 30)).toEqual({
      direction: "flat",
      tone: "neutral",
      label: "stable vs 30 j précédents",
    });
  });
});

describe("delayTrend", () => {
  it("is good when answers got faster", () => {
    expect(delayTrend(90, 210, 30)).toEqual({
      direction: "down",
      tone: "good",
      label: "-2 h vs 30 j précédents",
    });
  });

  it("is bad when answers got slower", () => {
    expect(delayTrend(2880, 1440, 30)).toEqual({
      direction: "up",
      tone: "bad",
      label: "+1 j vs 30 j précédents",
    });
  });

  it("is neutral within a minute", () => {
    expect(delayTrend(60, 60.4, 30)?.tone).toBe("neutral");
  });

  it("cannot compare without both periods", () => {
    expect(delayTrend(60, null, 30)).toBeNull();
    expect(delayTrend(null, 60, 30)).toBeNull();
  });
});

describe("urgencyOf", () => {
  const day = 24 * 60;

  it("is clear when nothing waits, whatever the age", () => {
    expect(urgencyOf(0, null)).toBe("clear");
    expect(urgencyOf(0, 10 * day)).toBe("clear");
  });

  it("gets more urgent as the oldest request ages", () => {
    expect(urgencyOf(2, 5 * 60)).toBe("calm");
    expect(urgencyOf(2, day - 1)).toBe("calm");
    expect(urgencyOf(2, day)).toBe("soon");
    expect(urgencyOf(2, 3 * day - 1)).toBe("soon");
    expect(urgencyOf(2, 3 * day)).toBe("late");
  });

  it("stays calm when the age is unknown", () => {
    expect(urgencyOf(2, null)).toBe("calm");
  });
});

describe("waitingMinutes", () => {
  const now = new Date("2026-09-24T12:00:00Z");

  it("measures the wait in minutes, at least one", () => {
    expect(waitingMinutes("2026-09-24T09:00:00Z", now)).toBe(180);
    expect(waitingMinutes("2026-09-24T12:00:30Z", now)).toBe(1);
    expect(waitingMinutes(null, now)).toBeNull();
  });
});

describe("withinDayRate", () => {
  it("is the share of answers given within 24 hours", () => {
    expect(withinDayRate([1, 1, 1, 1, 0])).toBe(75);
    expect(withinDayRate([0, 0, 0, 2, 2])).toBe(0);
    expect(withinDayRate([5, 0, 0, 0, 0])).toBe(100);
  });

  it("is unknown without any answer", () => {
    expect(withinDayRate([0, 0, 0, 0, 0])).toBeNull();
    expect(withinDayRate([])).toBeNull();
  });
});

describe("mergeSeries and peakOf", () => {
  const a = [
    { date: "2026-09-23", count: 1 },
    { date: "2026-09-24", count: 4 },
  ];

  it("adds two daily series day by day", () => {
    expect(
      mergeSeries(a, [
        { date: "2026-09-24", count: 2 },
        { date: "2026-09-25", count: 9 },
      ]),
    ).toEqual([
      { date: "2026-09-23", count: 1 },
      { date: "2026-09-24", count: 6 },
    ]);
  });

  it("finds the busiest day, the earliest one when tied, and none when all quiet", () => {
    expect(peakOf(a)).toEqual({ date: "2026-09-24", count: 4 });
    expect(
      peakOf([
        { date: "2026-09-23", count: 3 },
        { date: "2026-09-24", count: 3 },
      ]),
    ).toEqual({ date: "2026-09-23", count: 3 });
    expect(peakOf([{ date: "2026-09-23", count: 0 }])).toBeNull();
    expect(peakOf([])).toBeNull();
  });
});

describe("capitalizeFirst", () => {
  it("only raises the first letter, leaving the other words alone", () => {
    expect(capitalizeFirst("jeudi 24 septembre")).toBe("Jeudi 24 septembre");
    expect(capitalizeFirst("")).toBe("");
  });
});

describe("firstName", () => {
  it("keeps the first word of a full name", () => {
    expect(firstName("Camille Dubois")).toBe("Camille");
    expect(firstName("  Martine  ")).toBe("Martine");
    expect(firstName("")).toBe("");
  });
});

describe("summarySentence", () => {
  const appointments = (pending: number) =>
    ({ pending }) as AppointmentStats;
  const reports = (fresh: number) =>
    ({ backlog: { new: fresh } }) as ReportStats;

  it("reassures when nothing waits", () => {
    expect(summarySentence(appointments(0), reports(0))).toBe(
      "Tout est à jour : rien n'attend de réponse pour le moment.",
    );
  });

  it("names what waits, in agreement with the count", () => {
    expect(summarySentence(appointments(1), reports(0))).toBe(
      "1 rendez-vous attend une réponse.",
    );
    expect(summarySentence(appointments(3), reports(0))).toBe(
      "3 rendez-vous attendent une réponse.",
    );
    expect(summarySentence(appointments(0), reports(1))).toBe(
      "1 signalement attend d'être pris en charge.",
    );
    expect(summarySentence(appointments(0), reports(4))).toBe(
      "4 signalements attendent d'être pris en charge.",
    );
  });

  it("copes with a module that is switched off", () => {
    expect(summarySentence(appointments(2), undefined)).toBe(
      "2 rendez-vous attendent une réponse.",
    );
    expect(summarySentence(undefined, reports(1))).toBe(
      "1 signalement attend d'être pris en charge.",
    );
    expect(summarySentence(appointments(0), undefined)).toBe(
      "Tout est à jour : rien n'attend de réponse pour le moment.",
    );
  });

  it("stays welcoming when neither module is on", () => {
    expect(summarySentence(undefined, undefined)).toBe(
      "Retrouvez ici l'activité de votre commune.",
    );
  });

  it("puts both together", () => {
    expect(summarySentence(appointments(3), reports(1))).toBe(
      "3 rendez-vous et 1 signalement attendent une réponse.",
    );
    expect(summarySentence(appointments(2), reports(4))).toBe(
      "2 rendez-vous et 4 signalements attendent une réponse.",
    );
  });
});

describe("formatNumber", () => {
  it("groups thousands the French way", () => {
    expect(formatNumber(1260)).toMatch(/^1\s260$/);
    expect(formatNumber(342)).toBe("342");
  });
});

describe("pluralize", () => {
  it("uses the singular for one and zero, the plural above", () => {
    expect(pluralize(0, "vote", "votes")).toBe("vote");
    expect(pluralize(1, "vote", "votes")).toBe("vote");
    expect(pluralize(2, "vote", "votes")).toBe("votes");
  });
});

describe("parseStatsPeriod", () => {
  it("accepts the supported periods", () => {
    expect(parseStatsPeriod("7")).toBe(7);
    expect(parseStatsPeriod("90")).toBe(90);
  });

  it("falls back to 30 days for anything else", () => {
    expect(parseStatsPeriod(undefined)).toBe(30);
    expect(parseStatsPeriod("15")).toBe(30);
    expect(parseStatsPeriod("abc")).toBe(30);
    expect(parseStatsPeriod("")).toBe(30);
  });
});
