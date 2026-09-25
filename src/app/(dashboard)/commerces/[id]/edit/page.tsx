import { notFound } from "next/navigation";
import {
  getCommerce,
  getCommerceInvitations,
  getCommerceManagers,
} from "@/app/actions/commerces";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { CommerceForm } from "../../commerce-form";
import { CommerceManagerSection } from "../../commerce-manager-section";

export default async function EditCommercePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [commerce, managers, invitations] = await Promise.all([
    getCommerce(id),
    getCommerceManagers(id),
    getCommerceInvitations(id),
  ]);

  if (!commerce) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Modifier le commerce"
        backHref="/commerces"
        backLabel="Commerçants"
      />
      <Panel>
        <CommerceForm commerce={commerce} />
      </Panel>
      <Panel
        title="Personnes qui gèrent ce commerce"
        description="Chaque personne associée peut modifier elle-même cette fiche depuis l'application. Le personnel garde toujours la main pour modérer."
      >
        <CommerceManagerSection
          commerceId={id}
          managers={managers}
          invitations={invitations}
        />
      </Panel>
    </div>
  );
}
