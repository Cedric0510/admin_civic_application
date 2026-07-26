import { notFound } from "next/navigation";
import { getService } from "@/app/actions/services";
import { ServiceForm } from "../../service-form";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getService(id);

  if (!service) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">
        Modifier le service
      </h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ServiceForm service={service} />
      </div>
    </div>
  );
}
