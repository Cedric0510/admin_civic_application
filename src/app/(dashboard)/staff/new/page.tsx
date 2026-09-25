import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { StaffForm } from "../staff-form";

export default function NewStaffPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Nouvel agent" backHref="/staff" backLabel="Agents" />
      <Panel>
        <StaffForm />
      </Panel>
    </div>
  );
}
