import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { CommercesTable } from "./commerces-table";
import { getCommerces } from "@/app/actions/commerces";

export default async function CommercesPage() {
  const commerces = await getCommerces();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commerçants"
        description="L'annuaire des commerces de la commune. Chaque commerçant peut tenir sa propre fiche à jour depuis l'application."
        actions={
          <Link href="/commerces/new" className={buttonVariants({ size: "lg" })}>
            <Plus size={16} aria-hidden="true" />
            Nouveau commerce
          </Link>
        }
      />
      <Panel padded={false}>
        <CommercesTable commerces={commerces} />
      </Panel>
    </div>
  );
}
