import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getStaff } from "@/app/actions/staff";
import { StaffTable } from "./staff-table";

export default async function StaffPage() {
  const staff = await getStaff();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Comptes ayant accès à ce dashboard pour votre commune.
          </p>
        </div>
        <Link href="/staff/new" className={buttonVariants()}>
          <Plus size={16} />
          Nouvel agent
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <StaffTable staff={staff} />
      </div>
    </div>
  );
}
