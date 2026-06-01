import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ServiceForm } from "../../service-form";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: service } = await supabase
    .from("services")
    .select()
    .eq("id", id)
    .single();

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
