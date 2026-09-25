import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ServicesTable } from "./services-table";
import { getServices } from "@/app/actions/services";

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services municipaux"
        description="L'annuaire des services, et les créneaux de rendez-vous que les habitants peuvent y réserver."
        actions={
          <Link href="/services/new" className={buttonVariants({ size: "lg" })}>
            <Plus size={16} aria-hidden="true" />
            Nouveau service
          </Link>
        }
      />
      <Panel padded={false}>
        <ServicesTable services={services} />
      </Panel>
    </div>
  );
}
