import Link from "next/link";
import { Building2, ServerCrash } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { formatLongDate } from "@/lib/paris-time";
import { getCurrentStaff, getManagedCommune } from "@/lib/session";
import { getStatsOverview, parseStatsPeriod } from "@/lib/stats";
import {
  capitalizeFirst,
  firstName,
  summarySentence,
} from "@/lib/stats-format";
import type { StatsOverview } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { AppointmentsSection } from "@/components/stats/appointments-section";
import { ArticlesSection } from "@/components/stats/articles-section";
import { DashboardHero } from "@/components/stats/dashboard-hero";
import { PeriodSelector } from "@/components/stats/period-selector";
import { PollsSection } from "@/components/stats/polls-section";
import { ReportsSection } from "@/components/stats/reports-section";
import { ResidentsSection } from "@/components/stats/residents-section";
import { StatsSection } from "@/components/stats/stats-section";
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
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Tableau de bord
      </h1>
      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
        <Icon size={32} className="mx-auto text-slate-300" aria-hidden="true" />
        <p className="text-slate-600">{children}</p>
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
    <div className="space-y-10">
      <DashboardHero
        greeting={`Bonjour ${firstName(staff?.name ?? "")}`.trim()}
        dateLabel={capitalizeFirst(formatLongDate(now))}
        summary={summarySentence(overview.appointments, overview.reports)}
        context={
          overview.scope === "agent"
            ? `Votre activité à ${commune.name}`
            : commune.name
        }
      >
        <PeriodSelector active={days} onDark />
      </DashboardHero>

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

      {(overview.appointments || overview.reports) && (
        <StatsSection
          title="Relation avec les habitants"
          description="Rapidité de vos réponses et volume de demandes."
        >
          <div
            className={`grid grid-cols-1 items-start gap-4 ${overview.appointments && overview.reports ? "xl:grid-cols-2" : ""}`}
          >
            {overview.appointments && (
              <AppointmentsSection
                appointments={overview.appointments}
                days={days}
                scope={overview.scope}
              />
            )}
            {overview.reports && (
              <ReportsSection reports={overview.reports} days={days} />
            )}
          </div>
        </StatsSection>
      )}
    </div>
  );
}
