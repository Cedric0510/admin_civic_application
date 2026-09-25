import { notFound } from "next/navigation";
import { getServiceAgents, getService } from "@/app/actions/services";
import { getStaff } from "@/app/actions/staff";
import { getCurrentStaff } from "@/lib/session";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ServiceForm } from "../../service-form";
import { ServiceAgentsSection } from "../../service-agents-section";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [service, staff] = await Promise.all([
    getService(id),
    getCurrentStaff(),
  ]);

  if (!service) notFound();

  const canAffiliate = staff !== null && staff.role !== "AGENT";
  const [affiliated, members] = await Promise.all([
    getServiceAgents(id),
    canAffiliate ? getStaff() : Promise.resolve(null),
  ]);
  const candidates =
    members
      ?.filter((member) => member.role !== "SUPER_ADMIN")
      .map(({ id: memberId, name, role }) => ({ id: memberId, name, role })) ??
    null;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Modifier le service"
        backHref="/services"
        backLabel="Services"
      />
      <Panel>
        <ServiceForm service={service} />
      </Panel>
      <Panel
        title="Agents qui reçoivent sur ce service"
        description="Les habitants ne peuvent réserver que sur les créneaux libres de ces agents."
      >
        <ServiceAgentsSection
          key={affiliated.map((agent) => agent.id).join(",")}
          serviceId={service.id}
          affiliated={affiliated}
          candidates={candidates}
        />
      </Panel>
    </div>
  );
}
