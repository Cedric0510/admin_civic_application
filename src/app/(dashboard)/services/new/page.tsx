import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ServiceForm } from "../service-form";

export default function NewServicePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Nouveau service" backHref="/services" backLabel="Services" />
      <Panel>
        <ServiceForm />
      </Panel>
    </div>
  );
}
