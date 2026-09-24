import { notFound } from "next/navigation";
import { getServiceAgents, getService } from "@/app/actions/services";
import { getStaff } from "@/app/actions/staff";
import { getCurrentStaff } from "@/lib/session";
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
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">
        Modifier le service
      </h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <ServiceForm service={service} />
        <ServiceAgentsSection
          key={affiliated.map((agent) => agent.id).join(",")}
          serviceId={service.id}
          affiliated={affiliated}
          candidates={candidates}
        />
      </div>
    </div>
  );
}
