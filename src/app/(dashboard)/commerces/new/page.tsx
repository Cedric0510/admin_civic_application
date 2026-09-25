import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { CommerceForm } from "../commerce-form";

export default function NewCommercePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Nouveau commerce" backHref="/commerces" backLabel="Commerçants" />
      <Panel>
        <CommerceForm />
      </Panel>
    </div>
  );
}
