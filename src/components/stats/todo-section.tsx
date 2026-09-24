import { CalendarClock, TriangleAlert } from "lucide-react";
import type { AppointmentStats, ReportStats } from "@/lib/types";
import { waitingDuration } from "@/lib/stats-format";
import { StatCard } from "./stat-card";
import { StatsSection } from "./stats-section";

export function TodoSection({
  appointments,
  reports,
  scope,
  now,
}: {
  appointments: AppointmentStats;
  reports: ReportStats;
  scope: "commune" | "agent";
  now: Date;
}) {
  const oldestAppointment = waitingDuration(appointments.oldestPendingSince, now);
  const oldestReport = waitingDuration(reports.backlog.oldestNewSince, now);
  const reportCaption = [
    `${reports.backlog.inProgress} en cours`,
    oldestReport ? `le plus ancien attend ${oldestReport}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <StatsSection title="À traiter maintenant">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={CalendarClock}
          accent={appointments.pending > 0 ? "red" : "green"}
          label={
            scope === "agent"
              ? "Vos rendez-vous en attente"
              : "Rendez-vous en attente"
          }
          value={appointments.pending}
          caption={
            oldestAppointment
              ? `Le plus ancien attend ${oldestAppointment}`
              : "Aucune demande en attente"
          }
          href="/appointments"
        />
        <StatCard
          icon={TriangleAlert}
          accent={reports.backlog.new > 0 ? "red" : "green"}
          label="Signalements nouveaux"
          value={reports.backlog.new}
          caption={reportCaption}
          href="/reports"
        />
      </div>
    </StatsSection>
  );
}
