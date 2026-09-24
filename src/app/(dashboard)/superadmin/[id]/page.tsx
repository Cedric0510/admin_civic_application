import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCommunes } from "@/app/actions/superadmin";
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
      <div className="space-y-3">
        <Link
          href="/superadmin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Toutes les communes
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {commune.name}
          </h1>
          <p className="text-sm text-slate-500">
            Accès au dashboard et fonctionnalités de la commune (
            {commune.slug}).
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Accès</h2>
        <SuspensionCard
          communeId={commune.id}
          communeName={commune.name}
          suspendedAt={commune.suspendedAt}
        />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Modules</h2>
          <p className="text-sm text-slate-500">
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
