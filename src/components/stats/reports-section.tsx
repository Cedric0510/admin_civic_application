import { Megaphone } from "lucide-react";
import type { ReportStats } from "@/lib/types";
import { reportCategoryLabels } from "@/lib/report-labels";
import { MeterBar } from "./meter-bar";
import { RequestPanel } from "./request-panel";

export function ReportsSection({
  reports,
  days,
}: {
  reports: ReportStats;
  days: number;
}) {
  const highest = Math.max(0, ...reports.byCategory.map((row) => row.count));

  return (
    <RequestPanel
      icon={Megaphone}
      title="Signalements"
      subtitle="Délai entre le signalement d'un habitant et sa première prise en charge par la mairie."
      days={days}
      delay={reports.responseDelay}
      received={reports.received}
      receivedByDay={reports.receivedByDay}
      receivedLabel="Signalements reçus"
      statusTitle={`Où en sont les signalements reçus sur ${days} jours`}
      statusEmpty="Aucun signalement reçu sur cette période."
      segments={[
        { key: "new", label: "Nouveaux", value: reports.byStatus.new, tone: "bad" },
        {
          key: "progress",
          label: "En cours",
          value: reports.byStatus.inProgress,
          tone: "warn",
        },
        {
          key: "treated",
          label: "Traités",
          value: reports.byStatus.treated,
          tone: "good",
        },
      ]}
    >
      <div className="space-y-3 border-t border-slate-100 pt-5">
        <p className="text-sm font-medium text-slate-600">
          Signalements par catégorie
        </p>
        {reports.byCategory.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucun signalement sur cette période.
          </p>
        ) : (
          <ul className="space-y-3">
            {reports.byCategory.map((row) => (
              <li key={row.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-800">
                    {reportCategoryLabels[row.category]}
                  </span>
                  <span className="font-medium text-slate-600 tabular-nums">
                    {row.count}
                  </span>
                </div>
                <MeterBar
                  value={(row.count / highest) * 100}
                  label={`${reportCategoryLabels[row.category]} : ${row.count}`}
                  tone="warn"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </RequestPanel>
  );
}
