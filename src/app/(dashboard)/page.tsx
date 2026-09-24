import Link from "next/link";
import { Building2, ServerCrash } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { getCurrentStaff, getManagedCommune } from "@/lib/session";
import { getStatsOverview, parseStatsPeriod } from "@/lib/stats";
import type { StatsOverview } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { AppointmentsSection } from "@/components/stats/appointments-section";
import { ArticlesSection } from "@/components/stats/articles-section";
import { PeriodSelector } from "@/components/stats/period-selector";
import { PollsSection } from "@/components/stats/polls-section";
import { ReportsSection } from "@/components/stats/reports-section";
import { ResidentsSection } from "@/components/stats/residents-section";
import { TodoSection } from "@/components/stats/todo-section";

function Message({
  icon: Icon,
  children,
  action,
}: {
  icon: typeof Building2;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-8 text-center">
        <Icon size={32} className="mx-auto text-gray-400" aria-hidden="true" />
        <p className="text-gray-600">{children}</p>
        {action}
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const staff = await getCurrentStaff();
  const commune = await getManagedCommune(staff);

  if (!commune) {
    return (
      <Message
        icon={Building2}
        action={
          <Link href="/superadmin" className={buttonVariants()}>
            Voir les communes
          </Link>
        }
      >
        Vous êtes connecté en tant que super-administrateur. Choisissez une
        commune à gérer pour accéder à son tableau de bord.
      </Message>
    );
  }

  const days = parseStatsPeriod(period);
  let overview: StatsOverview;
  try {
    overview = await getStatsOverview(days, commune.id);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return (
      <Message
        icon={ServerCrash}
        action={
          <Link href={`/?period=${days}`} className={buttonVariants()}>
            Réessayer
          </Link>
        }
      >
        Impossible de charger les statistiques : {error.message}
      </Message>
    );
  }

  const now = new Date();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-gray-500">
            {overview.scope === "agent"
              ? `Votre activité à ${commune.name}`
              : commune.name}
          </p>
        </div>
        <PeriodSelector active={days} />
      </div>

      <TodoSection
        appointments={overview.appointments}
        reports={overview.reports}
        scope={overview.scope}
        now={now}
      />
      {overview.citizens && (
        <ResidentsSection citizens={overview.citizens} days={days} />
      )}
      {overview.articles && (
        <ArticlesSection articles={overview.articles} days={days} />
      )}
      {overview.polls && <PollsSection polls={overview.polls} />}
      <AppointmentsSection
        appointments={overview.appointments}
        days={days}
        scope={overview.scope}
      />
      <ReportsSection reports={overview.reports} days={days} />
    </div>
  );
}
