import { api } from "@/lib/api/client";
import type { StatsOverview, StatsPeriodDays } from "@/lib/types";

export const STATS_PERIODS: StatsPeriodDays[] = [7, 30, 90];
export const DEFAULT_STATS_PERIOD: StatsPeriodDays = 30;

export function parseStatsPeriod(value: string | undefined): StatsPeriodDays {
  const days = Number(value);
  return STATS_PERIODS.find((period) => period === days) ?? DEFAULT_STATS_PERIOD;
}

export function getStatsOverview(
  period: StatsPeriodDays,
  communeId: string,
): Promise<StatsOverview> {
  const query = new URLSearchParams({ period: String(period), communeId });
  return api.get<StatsOverview>(`/stats/overview?${query.toString()}`);
}
