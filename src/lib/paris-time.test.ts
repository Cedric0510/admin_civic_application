import { describe, expect, it } from "vitest";
import {
  addDays,
  formatCompactDateTime,
  formatDayMonth,
  formatLongDate,
  formatShortDate,
  formatTime,
  isValidDate,
  mondayOf,
  parisDate,
  parisHour,
} from "./paris-time";

describe("paris-time", () => {
  it("gives the Paris calendar day, which can differ from the UTC one", () => {
    expect(parisDate("2026-07-14T22:30:00.000Z")).toBe("2026-07-15");
    expect(parisDate("2026-07-15T21:30:00.000Z")).toBe("2026-07-15");
  });

  it("gives the Paris hour, following the daylight-saving offset", () => {
    expect(parisHour("2026-07-15T07:00:00.000Z")).toBe(9);
    expect(parisHour("2026-01-15T08:00:00.000Z")).toBe(9);
    expect(parisHour("2026-07-15T22:00:00.000Z")).toBe(0);
  });

  it("writes the long date in French, following the Paris day", () => {
    expect(formatLongDate("2026-09-24T12:00:00.000Z")).toBe("jeudi 24 septembre");
    expect(formatLongDate("2026-09-24T22:30:00.000Z")).toBe("vendredi 25 septembre");
  });

  it("writes the short date with the Paris day", () => {
    expect(formatShortDate("2026-09-24T12:00:00.000Z")).toBe("24/09/2026");
    expect(formatShortDate("2026-09-24T22:30:00.000Z")).toBe("25/09/2026");
  });

  it("writes a compact date and time in the Paris timezone", () => {
    const text = formatCompactDateTime("2026-09-29T07:00:00.000Z");

    expect(text).toContain("29");
    expect(text).toContain("09:00");
  });

  it("formats a time in Paris time", () => {
    expect(formatTime("2026-07-15T07:30:00.000Z")).toBe("09:30");
  });

  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("finds the Monday of the week, Sunday included", () => {
    expect(mondayOf("2026-10-14")).toBe("2026-10-12");
    expect(mondayOf("2026-10-18")).toBe("2026-10-12");
    expect(mondayOf("2026-10-12")).toBe("2026-10-12");
  });

  it("validates real calendar dates only", () => {
    expect(isValidDate("2026-02-28")).toBe(true);
    expect(isValidDate("2026-02-30")).toBe(false);
    expect(isValidDate("demain")).toBe(false);
  });

  it("formats a day and month without shifting the day", () => {
    expect(formatDayMonth("2026-10-14")).toBe("14/10");
  });
});
