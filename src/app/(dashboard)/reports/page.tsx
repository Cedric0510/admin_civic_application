import { getReports } from "@/app/actions/reports";
import { ReportsTable } from "./reports-table";

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Signalements</h1>

      <div className="bg-white rounded-xl border border-gray-200">
        <ReportsTable reports={reports} />
      </div>
    </div>
  );
}
