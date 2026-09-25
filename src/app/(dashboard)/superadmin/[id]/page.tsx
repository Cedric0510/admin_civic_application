import { notFound } from "next/navigation";
import { getCommunes } from "@/app/actions/superadmin";
import { PageHeader } from "@/components/layout/page-header";
import { ModulesForm } from "./modules-form";
import { SuspensionCard } from "./suspension-card";

export default async function CommuneAccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const commune = (await getCommunes()).find((candidate) => candidate.id === id);
  if (!commune) notFound();

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader
        title={commune.name}
        description={`Accès au dashboard et fonctionnalités de la commune (${commune.slug}).`}
        backHref="/superadmin"
        backLabel="Toutes les communes"
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Accès</h2>
        <SuspensionCard
          communeId={commune.id}
          communeName={commune.name}
          suspendedAt={commune.suspendedAt}
        />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Modules</h2>
          <p className="text-sm text-muted-foreground">
            Un module désactivé disparaît du dashboard et de l&apos;application
            des habitants. Les données sont conservées et reviennent dès la
            réactivation.
          </p>
        </div>
        <ModulesForm
          communeId={commune.id}
          initialDisabled={commune.disabledModules}
        />
      </section>
    </div>
  );
}
