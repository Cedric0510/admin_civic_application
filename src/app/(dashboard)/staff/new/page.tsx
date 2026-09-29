import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ManagedCommuneNotice } from "@/components/layout/managed-commune-notice";
import { getManagedCommune } from "@/lib/session";
import { StaffForm } from "../staff-form";

export default async function NewStaffPage() {
  const commune = await getManagedCommune();

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Nouvel agent" backHref="/staff" backLabel="Agents" />
      {commune ? (
        <Panel>
          <StaffForm />
        </Panel>
      ) : (
        <ManagedCommuneNotice />
      )}
    </div>
  );
}
