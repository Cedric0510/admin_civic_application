import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAgendaWeek } from "@/app/actions/agenda";
import { getStaff } from "@/app/actions/staff";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentStaff } from "@/lib/session";
import {
  addDays,
  formatDayMonth,
  isValidDate,
  mondayOf,
  todayInParis,
} from "@/lib/paris-time";
import { cn } from "@/lib/utils";
import { AgendaGrid } from "./agenda-grid";
import { WorkingHoursForm } from "./working-hours-form";

function agendaHref(week: string, agent: string, isSelf: boolean) {
  const params = new URLSearchParams({ week });
  if (!isSelf) params.set("agent", agent);
  return `/agenda?${params.toString()}`;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; agent?: string }>;
}) {
  const { week, agent } = await searchParams;
  const staff = await getCurrentStaff();
  if (!staff) redirect("/login");

  const isAgent = staff.role === "AGENT";
  const members = isAgent
    ? []
    : (await getStaff()).filter((member) => member.role !== "SUPER_ADMIN");
  const agentId = isAgent
    ? staff.id
    : (members.find((member) => member.id === agent) ??
        members.find((member) => member.id === staff.id) ??
        members[0])?.id;

  if (!agentId) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <p className="text-sm text-gray-500">
          Aucun agent dans cette commune : créez-en un depuis la page Agents.
        </p>
      </div>
    );
  }

  const weekStart = mondayOf(week && isValidDate(week) ? week : todayInParis());
  const view = await getAgendaWeek(weekStart, agentId);
  const isSelf = agentId === staff.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="mt-1 text-sm text-gray-500">
            Les citoyens ne peuvent réserver que les créneaux disponibles des
            agents affiliés au service (voir la page Services).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={agendaHref(addDays(weekStart, -7), agentId, isSelf)}
            className={buttonVariants({ variant: "outline", size: "icon" })}
            aria-label="Semaine précédente"
          >
            <ChevronLeft size={16} />
          </Link>
          <span className="min-w-40 text-center text-sm font-medium text-gray-700">
            Du {formatDayMonth(weekStart)} au{" "}
            {formatDayMonth(addDays(weekStart, 6))}
          </span>
          <Link
            href={agendaHref(addDays(weekStart, 7), agentId, isSelf)}
            className={buttonVariants({ variant: "outline", size: "icon" })}
            aria-label="Semaine suivante"
          >
            <ChevronRight size={16} />
          </Link>
          <Link
            href={agendaHref(todayInParis(), agentId, isSelf)}
            className={buttonVariants({ variant: "outline" })}
          >
            Aujourd&apos;hui
          </Link>
        </div>
      </div>

      {members.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <Link
              key={member.id}
              href={agendaHref(weekStart, member.id, member.id === staff.id)}
              className={cn(
                buttonVariants({
                  variant: member.id === agentId ? "default" : "outline",
                  size: "sm",
                }),
              )}
            >
              {member.name}
            </Link>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <AgendaGrid key={`${agentId}-${weekStart}`} week={view} />
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Horaires habituels
          </h2>
          <p className="text-sm text-gray-500">
            Créneaux proposés par défaut chaque semaine, entre 6h et 22h. Les
            exceptions ci-dessus (absence, télétravail, ouverture ponctuelle)
            s&apos;appliquent par-dessus.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <WorkingHoursForm
            key={agentId}
            staffMemberId={agentId}
            workingHours={view.workingHours}
          />
        </div>
      </section>
    </div>
  );
}
