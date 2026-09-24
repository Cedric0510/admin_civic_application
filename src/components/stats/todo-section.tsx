import { CalendarClock, TriangleAlert } from "lucide-react";
import type { AppointmentStats, ReportStats } from "@/lib/types";
import {
  pluralize,
  urgencyOf,
  waitingDuration,
  waitingMinutes,
} from "@/lib/stats-format";
import { SegmentedBar } from "./segmented-bar";
import { StatsSection } from "./stats-section";
import { TaskCard } from "./task-card";

export function TodoSection({
  appointments,
  reports,
  scope,
  now,
}: {
  appointments?: AppointmentStats;
  reports?: ReportStats;
  scope: "commune" | "agent";
  now: Date;
}) {
  if (!appointments && !reports) return null;

  return (
    <StatsSection title="À traiter maintenant">
      <div
        className={`grid grid-cols-1 gap-4 ${appointments && reports ? "md:grid-cols-2" : ""}`}
      >
        {appointments && (
          <TaskCard
            icon={CalendarClock}
            title={
              scope === "agent"
                ? "Vos rendez-vous à confirmer"
                : "Rendez-vous à confirmer"
            }
            count={appointments.pending}
            unit={pluralize(appointments.pending, "demande", "demandes")}
            urgency={urgencyOf(
              appointments.pending,
              waitingMinutes(appointments.oldestPendingSince, now),
            )}
            waiting={waitingDuration(appointments.oldestPendingSince, now)}
            href="/appointments"
            actionLabel="Voir les rendez-vous"
          />
        )}
        {reports && (
          <TaskCard
            icon={TriangleAlert}
            title="Signalements à prendre en charge"
            count={reports.backlog.new}
            unit={pluralize(reports.backlog.new, "signalement", "signalements")}
            urgency={urgencyOf(
              reports.backlog.new,
              waitingMinutes(reports.backlog.oldestNewSince, now),
            )}
            waiting={waitingDuration(reports.backlog.oldestNewSince, now)}
            href="/reports"
            actionLabel="Voir les signalements"
          >
            {reports.backlog.new + reports.backlog.inProgress > 0 && (
              <div className="pt-1">
                <SegmentedBar
                  emptyLabel=""
                  segments={[
                    {
                      key: "new",
                      label: "Nouveaux",
                      value: reports.backlog.new,
                      tone: "bad",
                    },
                    {
                      key: "progress",
                      label: "Déjà en cours",
                      value: reports.backlog.inProgress,
                      tone: "warn",
                    },
                  ]}
                />
              </div>
            )}
          </TaskCard>
        )}
      </div>
    </StatsSection>
  );
}
