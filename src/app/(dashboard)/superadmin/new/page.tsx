import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { CommuneProvisionForm } from "../commune-provision-form";

export default function NewCommunePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Nouvelle commune"
        backHref="/superadmin"
        backLabel="Communes"
      />
      <Panel>
        <CommuneProvisionForm />
      </Panel>
    </div>
  );
}
