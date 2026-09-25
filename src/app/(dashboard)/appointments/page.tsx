import { getAppointments } from "@/app/actions/appointments";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { parisDate } from "@/lib/paris-time";
import { AppointmentsTable } from "./appointments-table";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; date?: string }>;
}) {
  const { service, date } = await searchParams;
  const allAppointments = await getAppointments();

  const appointments = allAppointments
    .filter((a) => !service || a.service.name === service)
    .filter((a) => !date || parisDate(a.startsAt) === date)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const services = Array.from(
    new Set(allAppointments.map((a) => a.service.name)),
  ).sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rendez-vous"
        description="Les demandes des habitants sur les créneaux libres de vos agents. Confirmez ou annulez chaque demande."
      />
      <Panel padded={false}>
        <AppointmentsTable
          appointments={appointments}
          services={services}
          currentService={service}
          currentDate={date}
        />
      </Panel>
    </div>
  );
}
