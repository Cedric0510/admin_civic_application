const TIME_ZONE = "Europe/Paris";
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const dateFormatter = new Intl.DateTimeFormat("fr-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const hourFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  hourCycle: "h23",
});

export function parisDate(instant: string | Date): string {
  return dateFormatter.format(new Date(instant));
}

export function parisHour(instant: string | Date): number {
  const hour = hourFormatter
    .formatToParts(new Date(instant))
    .find((part) => part.type === "hour");
  return Number(hour?.value);
}

export function todayInParis(): string {
  return parisDate(new Date());
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}

export function mondayOf(date: string): string {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return addDays(date, 1 - (day === 0 ? 7 : day));
}

export function formatDateTime(instant: string | Date): string {
  return new Date(instant).toLocaleString("fr-FR", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCompactDateTime(instant: string | Date): string {
  return new Date(instant).toLocaleString("fr-FR", {
    timeZone: TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatLongDate(instant: string | Date): string {
  return new Date(instant).toLocaleDateString("fr-FR", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatShortDate(instant: string | Date): string {
  return new Date(instant).toLocaleDateString("fr-FR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(instant: string | Date): string {
  return new Date(instant).toLocaleTimeString("fr-FR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDayMonth(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("fr-FR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
  });
}
