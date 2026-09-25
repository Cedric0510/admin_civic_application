import { getReports } from "@/app/actions/reports";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ReportsTable } from "./reports-table";

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Signalements"
        description="Les problèmes signalés par les habitants, avec leur photo. Faites avancer leur statut au fil du traitement."
      />
      <Panel padded={false}>
        <ReportsTable reports={reports} />
      </Panel>
    </div>
  );
}
