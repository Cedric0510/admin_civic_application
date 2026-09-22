import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CommercesTable } from "./commerces-table";
import { getCommerces } from "@/app/actions/commerces";

export default async function CommercesPage() {
  const commerces = await getCommerces();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Commerçants</h1>
        <Link href="/commerces/new" className={buttonVariants()}>
          <Plus size={16} />
          Nouveau commerce
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <CommercesTable commerces={commerces} />
      </div>
    </div>
  );
}
