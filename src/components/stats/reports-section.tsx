import { Megaphone, Timer } from "lucide-react";
import type { ReportStats } from "@/lib/types";
import { reportCategoryLabels } from "@/lib/report-labels";
import {
  countTrend,
  delayTrend,
  formatDuration,
  pluralize,
} from "@/lib/stats-format";
import { MeterBar } from "./meter-bar";
import { StatCard } from "./stat-card";
import { ChartCard, StatsSection } from "./stats-section";

export function ReportsSection({
  reports,
  days,
}: {
  reports: ReportStats;
  days: number;
}) {
  const { current, previous } = reports.responseDelay;
  const highest = Math.max(0, ...reports.byCategory.map((row) => row.count));

  return (
    <StatsSection
      title="Signalements"
      description="Délai entre le signalement d'un habitant et sa première prise en charge par la mairie."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={Timer}
          accent="amber"
          label={`Délai de prise en charge habituel (${days} j)`}
          value={formatDuration(current.medianMinutes)}
          caption={
            current.answered === 0
              ? "Aucune prise en charge sur cette période"
              : `${current.answered} ${pluralize(current.answered, "signalement pris en charge", "signalements pris en charge")} · en moyenne ${formatDuration(current.meanMinutes)}`
          }
          trend={delayTrend(current.medianMinutes, previous.medianMinutes, days)}
        />
        <StatCard
          icon={Megaphone}
          accent="blue"
          label={`Signalements reçus (${days} j)`}
          value={reports.received.current}
          trend={countTrend(
            reports.received.current,
            reports.received.previous,
            days,
          )}
        />
      </div>
      <ChartCard title={`Signalements reçus par catégorie (${days} j)`}>
        {reports.byCategory.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucun signalement sur cette période.
          </p>
        ) : (
          <ul className="space-y-3">
            {reports.byCategory.map((row) => (
              <li key={row.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-900">
                    {reportCategoryLabels[row.category]}
                  </span>
                  <span className="text-gray-500">{row.count}</span>
                </div>
                <MeterBar
                  value={(row.count / highest) * 100}
                  label={`${reportCategoryLabels[row.category]} : ${row.count}`}
                  className="bg-amber-500"
                />
              </li>
            ))}
          </ul>
        )}
      </ChartCard>
    </StatsSection>
  );
}
