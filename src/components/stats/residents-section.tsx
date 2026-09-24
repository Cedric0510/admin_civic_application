import type { CitizenStats } from "@/lib/types";
import { countTrend, pluralize } from "@/lib/stats-format";
import { DailyBars } from "./daily-bars";
import { MiniStat } from "./kpi-card";
import { Panel, StatsSection } from "./stats-section";

export function ResidentsSection({
  citizens,
  days,
}: {
  citizens: CitizenStats;
  days: number;
}) {
  return (
    <StatsSection
      title="Habitants"
      description="Les comptes rattachés à votre commune dans l'application."
    >
      <Panel>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <div className="space-y-6">
            <MiniStat
              label="Habitants inscrits"
              value={citizens.total}
              unit={pluralize(citizens.total, "compte", "comptes")}
              hint={
                citizens.commercants > 0
                  ? `dont ${citizens.commercants} ${pluralize(citizens.commercants, "commerçant", "commerçants")}`
                  : undefined
              }
            />
            <MiniStat
              label={`Arrivés ces ${days} derniers jours`}
              value={citizens.arrivals.current}
              trend={countTrend(
                citizens.arrivals.current,
                citizens.arrivals.previous,
                days,
              )}
            />
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-slate-600">
              Nouvelles inscriptions par jour
            </p>
            <DailyBars
              series={citizens.arrivalsByDay}
              label="Nouveaux inscrits"
              emptyLabel="Aucune arrivée sur cette période"
              tone="violet"
            />
          </div>
        </div>
      </Panel>
    </StatsSection>
  );
}
