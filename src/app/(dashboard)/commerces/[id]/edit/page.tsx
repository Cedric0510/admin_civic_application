import { notFound } from "next/navigation";
import { getCommerce, getCommerceManager } from "@/app/actions/commerces";
import { CommerceForm } from "../../commerce-form";
import { CommerceManagerSection } from "../../commerce-manager-section";

export default async function EditCommercePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [commerce, manager] = await Promise.all([
    getCommerce(id),
    getCommerceManager(id),
  ]);

  if (!commerce) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">
        Modifier le commerce
      </h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <CommerceForm commerce={commerce} />
        <CommerceManagerSection commerceId={id} initialManager={manager} />
      </div>
    </div>
  );
}
