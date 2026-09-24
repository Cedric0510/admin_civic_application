const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

export type TrendView = {
  direction: "up" | "down" | "flat";
  tone: "good" | "bad" | "neutral";
  label: string;
};

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

export function waitingDuration(
  since: string | null,
  now: Date,
): string | null {
  if (since === null) return null;
  const minutes = (now.getTime() - new Date(since).getTime()) / 60000;
  return formatDuration(Math.max(1, minutes));
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

export function formatNumber(value: number): string {
  return value.toLocaleString("fr-FR");
}

export function pluralize(count: number, singular: string, plural: string) {
  return count > 1 ? plural : singular;
}
