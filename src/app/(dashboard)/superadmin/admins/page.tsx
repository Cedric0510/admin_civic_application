import Link from "next/link";
import { Plus } from "lucide-react";
import { getSuperAdmins } from "@/app/actions/staff";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { SuperAdminsTable } from "./super-admins-table";

export default async function SuperAdminsPage() {
  const admins = await getSuperAdmins();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super-administrateurs"
        description="Comptes ayant un accès complet à toutes les communes de la plateforme."
        backHref="/superadmin"
        backLabel="Communes"
        actions={
          <Link
            href="/superadmin/admins/new"
            className={buttonVariants({ size: "lg" })}
          >
            <Plus size={16} aria-hidden="true" />
            Nouveau super-administrateur
          </Link>
        }
      />
      <Panel padded={false}>
        <SuperAdminsTable admins={admins} />
      </Panel>
    </div>
  );
}
