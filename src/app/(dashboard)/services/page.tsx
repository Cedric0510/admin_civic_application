import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ServicesTable } from "./services-table";
import { getServices } from "@/app/actions/services";

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Services municipaux</h1>
        <Link href="/services/new" className={buttonVariants()}>
            <Plus size={16} />
            Nouveau service
          </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <ServicesTable services={services} />
      </div>
    </div>
  );
}
