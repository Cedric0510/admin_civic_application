import { createClient } from "@/lib/supabase/server";
import { AppointmentsTable } from "./appointments-table";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; date?: string }>;
}) {
  const { service, date } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("appointments")
    .select("*")
    .order("date", { ascending: true });

  if (service) query = query.eq("service", service);
  if (date) query = query.eq("date", date);

  const { data: appointments } = await query;

  const { data: allAppointments } = await supabase
    .from("appointments")
    .select("service");

  const services = Array.from(
    new Set(allAppointments?.map((a) => a.service) ?? []),
  ).sort();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Rendez-vous</h1>

      <div className="bg-white rounded-xl border border-gray-200">
        <AppointmentsTable
          appointments={appointments ?? []}
          services={services}
          currentService={service}
          currentDate={date}
        />
      </div>
    </div>
  );
}
