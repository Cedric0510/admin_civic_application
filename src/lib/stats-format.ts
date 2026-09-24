import type {
  AppointmentStats,
  DailyCount,
  ReportStats,
} from "@/lib/types";

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
const SOON_AFTER_MINUTES = MINUTES_PER_DAY;
const LATE_AFTER_MINUTES = 3 * MINUTES_PER_DAY;
const WITHIN_A_DAY_BUCKETS = 3;

export type TrendView = {
  direction: "up" | "down" | "flat";
  tone: "good" | "bad" | "neutral";
  label: string;
};

export type Urgency = "clear" | "calm" | "soon" | "late";

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—";
  if (minutes < 1) return "moins d'1 min";
  if (minutes < MINUTES_PER_HOUR) return `${Math.round(minutes)} min`;

  if (minutes < MINUTES_PER_DAY) {
    const totalMinutes = Math.round(minutes);
    const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
    const rest = totalMinutes % MINUTES_PER_HOUR;
    return rest === 0
      ? `${hours} h`
      : `${hours} h ${String(rest).padStart(2, "0")}`;
  }

  let days = Math.floor(minutes / MINUTES_PER_DAY);
  let hours = Math.round((minutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR);
  if (hours === 24) {
    days += 1;
    hours = 0;
  }
  return hours === 0 ? `${days} j` : `${days} j ${hours} h`;
}

export function waitingMinutes(since: string | null, now: Date): number | null {
  if (since === null) return null;
  const minutes = (now.getTime() - new Date(since).getTime()) / 60000;
  return Math.max(1, minutes);
}

export function waitingDuration(
  since: string | null,
  now: Date,
): string | null {
  const minutes = waitingMinutes(since, now);
  return minutes === null ? null : formatDuration(minutes);
}

export function urgencyOf(count: number, oldestWaiting: number | null): Urgency {
  if (count === 0) return "clear";
  if (oldestWaiting === null || oldestWaiting < SOON_AFTER_MINUTES) return "calm";
  return oldestWaiting < LATE_AFTER_MINUTES ? "soon" : "late";
}

function signed(delta: number, text: string): string {
  return `${delta > 0 ? "+" : "-"}${text}`;
}

export function countTrend(
  current: number,
  previous: number,
  days: number,
  goodWhen: "up" | "down" = "up",
): TrendView {
  const delta = current - previous;
  if (delta === 0) {
    return {
      direction: "flat",
      tone: "neutral",
      label: `stable vs ${days} j précédents`,
    };
  }
  return {
    direction: delta > 0 ? "up" : "down",
    tone: delta > 0 === (goodWhen === "up") ? "good" : "bad",
    label: `${signed(delta, String(Math.abs(delta)))} vs ${days} j précédents`,
  };
}

export function delayTrend(
  current: number | null,
  previous: number | null,
  days: number,
): TrendView | null {
  if (current === null || previous === null) return null;
  const delta = current - previous;
  if (Math.abs(delta) < 1) {
    return {
      direction: "flat",
      tone: "neutral",
      label: `stable vs ${days} j précédents`,
    };
  }
  return {
    direction: delta > 0 ? "up" : "down",
    tone: delta < 0 ? "good" : "bad",
    label: `${signed(delta, formatDuration(Math.abs(delta)))} vs ${days} j précédents`,
  };
}

export function withinDayRate(buckets: number[]): number | null {
  const total = buckets.reduce((sum, count) => sum + count, 0);
  if (total === 0) return null;
  const quick = buckets
    .slice(0, WITHIN_A_DAY_BUCKETS)
    .reduce((sum, count) => sum + count, 0);
  return Math.round((quick / total) * 100);
}

export function mergeSeries(a: DailyCount[], b: DailyCount[]): DailyCount[] {
  const second = new Map(b.map((day) => [day.date, day.count]));
  return a.map((day) => ({
    date: day.date,
    count: day.count + (second.get(day.date) ?? 0),
  }));
}

export function peakOf(series: DailyCount[]): DailyCount | null {
  let peak: DailyCount | null = null;
  for (const day of series) {
    if (day.count > 0 && (peak === null || day.count > peak.count)) peak = day;
  }
  return peak;
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function summarySentence(
  appointments: AppointmentStats | undefined,
  reports: ReportStats | undefined,
): string {
  if (!appointments && !reports) {
    return "Retrouvez ici l'activité de votre commune.";
  }
  const waitingAppointments = appointments?.pending ?? 0;
  const newReports = reports?.backlog.new ?? 0;

  if (waitingAppointments === 0 && newReports === 0) {
    return "Tout est à jour : rien n'attend de réponse pour le moment.";
  }
  if (newReports === 0) {
    return `${waitingAppointments} rendez-vous ${pluralize(waitingAppointments, "attend", "attendent")} une réponse.`;
  }
  if (waitingAppointments === 0) {
    return `${newReports} ${pluralize(newReports, "signalement", "signalements")} ${pluralize(newReports, "attend", "attendent")} d'être pris en charge.`;
  }
  return `${waitingAppointments} rendez-vous et ${newReports} ${pluralize(newReports, "signalement", "signalements")} attendent une réponse.`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("fr-FR");
}

export function pluralize(count: number, singular: string, plural: string) {
  return count > 1 ? plural : singular;
}
