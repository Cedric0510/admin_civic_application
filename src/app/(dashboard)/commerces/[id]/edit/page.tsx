import { notFound } from "next/navigation";
import { getCommerce } from "@/app/actions/commerces";
import { CommerceForm } from "../../commerce-form";

export default async function EditCommercePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const commerce = await getCommerce(id);

  if (!commerce) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">
        Modifier le commerce
      </h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CommerceForm commerce={commerce} />
      </div>
    </div>
  );
}
