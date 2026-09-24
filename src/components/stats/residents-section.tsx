import { UserPlus, Users } from "lucide-react";
import type { CitizenStats } from "@/lib/types";
import { countTrend, pluralize } from "@/lib/stats-format";
import { DailyBars } from "./daily-bars";
import { StatCard } from "./stat-card";
import { ChartCard, StatsSection } from "./stats-section";

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
      description="Comptes rattachés à votre commune dans l'application."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={Users}
          accent="purple"
          label="Comptes inscrits"
          value={citizens.total}
          caption={
            citizens.commercants > 0
              ? `dont ${citizens.commercants} ${pluralize(citizens.commercants, "commerçant", "commerçants")}`
              : undefined
          }
        />
        <StatCard
          icon={UserPlus}
          accent="blue"
          label={`Nouveaux inscrits (${days} j)`}
          value={citizens.arrivals.current}
          trend={countTrend(
            citizens.arrivals.current,
            citizens.arrivals.previous,
            days,
          )}
        />
      </div>
      <ChartCard title="Arrivées par jour">
        <DailyBars
          series={citizens.arrivalsByDay}
          label="Nouveaux inscrits"
          emptyLabel="Aucune arrivée sur cette période"
          barClassName="bg-purple-500"
        />
      </ChartCard>
    </StatsSection>
  );
}
