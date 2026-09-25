import Link from "next/link";
import { Plus } from "lucide-react";
import { getStaff } from "@/app/actions/staff";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { StaffTable } from "./staff-table";

export default async function StaffPage() {
  const staff = await getStaff();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        description="Comptes ayant accès à ce dashboard pour votre commune."
        actions={
          <Link href="/staff/new" className={buttonVariants({ size: "lg" })}>
            <Plus size={16} aria-hidden="true" />
            Nouvel agent
          </Link>
        }
      />
      <Panel padded={false}>
        <StaffTable staff={staff} />
      </Panel>
    </div>
  );
}
