import Link from "next/link";
import { Plus } from "lucide-react";
import { getStaff } from "@/app/actions/staff";
import { buttonVariants } from "@/components/ui/button";
import { ManagedCommuneNotice } from "@/components/layout/managed-commune-notice";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { getManagedCommune } from "@/lib/session";
import { StaffTable } from "./staff-table";

export default async function StaffPage() {
  const commune = await getManagedCommune();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        description="Comptes ayant accès à ce dashboard pour votre commune."
        actions={
          commune && (
            <Link href="/staff/new" className={buttonVariants({ size: "lg" })}>
              <Plus size={16} aria-hidden="true" />
              Nouvel agent
            </Link>
          )
        }
      />
      {commune ? (
        <Panel padded={false}>
          <StaffTable staff={await getStaff()} />
        </Panel>
      ) : (
        <ManagedCommuneNotice />
      )}
    </div>
  );
}
