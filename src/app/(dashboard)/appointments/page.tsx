import { getAppointments } from "@/app/actions/appointments";
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
    .filter((a) => !date || a.date.slice(0, 10) === date)
    .sort((a, b) => a.date.localeCompare(b.date));

  const services = Array.from(
    new Set(allAppointments.map((a) => a.service.name)),
  ).sort();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Rendez-vous</h1>

      <div className="bg-white rounded-xl border border-gray-200">
        <AppointmentsTable
          appointments={appointments}
          services={services}
          currentService={service}
          currentDate={date}
        />
      </div>
    </div>
  );
}
