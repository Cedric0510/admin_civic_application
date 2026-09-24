import { CalendarDays } from "lucide-react";
import type { AppointmentStats } from "@/lib/types";
import { RequestPanel } from "./request-panel";

export function AppointmentsSection({
  appointments,
  days,
  scope,
}: {
  appointments: AppointmentStats;
  days: number;
  scope: "commune" | "agent";
}) {
  return (
    <RequestPanel
      icon={CalendarDays}
      title="Rendez-vous"
      subtitle={`Délai entre la demande d'un habitant et la première réponse (confirmation ou annulation)${scope === "agent" ? ", sur les rendez-vous qui vous sont attribués" : ""}.`}
      days={days}
      delay={appointments.responseDelay}
      received={appointments.received}
      receivedByDay={appointments.receivedByDay}
      receivedLabel="Demandes reçues"
      statusTitle={`Où en sont les demandes reçues sur ${days} jours`}
      statusEmpty="Aucune demande reçue sur cette période."
      segments={[
        {
          key: "confirmed",
          label: "Confirmés",
          value: appointments.outcomes.confirmed,
          tone: "good",
        },
        {
          key: "pending",
          label: "En attente",
          value: appointments.outcomes.pending,
          tone: "warn",
        },
        {
          key: "cancelled",
          label: "Annulés",
          value: appointments.outcomes.cancelled,
          tone: "neutral",
        },
      ]}
    />
  );
}
