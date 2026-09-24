import { CalendarPlus, Timer } from "lucide-react";
import type { AppointmentStats } from "@/lib/types";
import {
  countTrend,
  delayTrend,
  formatDuration,
  pluralize,
} from "@/lib/stats-format";
import { StatCard } from "./stat-card";
import { StatsSection } from "./stats-section";

export function AppointmentsSection({
  appointments,
  days,
  scope,
}: {
  appointments: AppointmentStats;
  days: number;
  scope: "commune" | "agent";
}) {
  const { current, previous } = appointments.responseDelay;

  return (
    <StatsSection
      title="Rendez-vous"
      description={`Délai entre la demande d'un habitant et la première réponse (confirmation ou refus)${scope === "agent" ? ", sur les rendez-vous qui vous sont attribués" : ""}.`}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={Timer}
          accent="amber"
          label={`Délai de réponse habituel (${days} j)`}
          value={formatDuration(current.medianMinutes)}
          caption={
            current.answered === 0
              ? "Aucune réponse sur cette période"
              : `${current.answered} ${pluralize(current.answered, "réponse", "réponses")} · en moyenne ${formatDuration(current.meanMinutes)}`
          }
          trend={delayTrend(current.medianMinutes, previous.medianMinutes, days)}
        />
        <StatCard
          icon={CalendarPlus}
          accent="blue"
          label={`Demandes reçues (${days} j)`}
          value={appointments.received.current}
          trend={countTrend(
            appointments.received.current,
            appointments.received.previous,
            days,
          )}
        />
      </div>
    </StatsSection>
  );
}
