"use client";

import {
  clearAvailability,
  setAvailability,
  type AvailabilityTarget,
} from "@/app/actions/agenda";
import { cn } from "@/lib/utils";
import { formatDayMonth, formatTime, parisDate, parisHour } from "@/lib/paris-time";
import { Ban, Check, RotateCcw } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import type { AgendaWeek, AvailabilityState } from "@/lib/types";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const AFTERNOON_START = 12;
const GRID_COLUMNS = "grid grid-cols-[4rem_repeat(7,minmax(0,1fr))] gap-1";

type Scope = Pick<AvailabilityTarget, "scope" | "date" | "period" | "hour">;

function RuleButtons({
  label,
  disabled,
  onSet,
  onClear,
}: {
  label: string;
  disabled: boolean;
  onSet: (state: AvailabilityState) => void;
  onClear: () => void;
}) {
  const base =
    "rounded p-1 transition-colors hover:bg-gray-100 disabled:opacity-40";
  return (
    <div className="flex items-center justify-center gap-0.5">
      <button
        type="button"
        title={`${label} : disponible`}
        aria-label={`${label} : disponible`}
        disabled={disabled}
        onClick={() => onSet("DISPONIBLE")}
        className={cn(base, "text-emerald-600")}
      >
        <Check size={14} />
      </button>
      <button
        type="button"
        title={`${label} : indisponible`}
        aria-label={`${label} : indisponible`}
        disabled={disabled}
        onClick={() => onSet("INDISPONIBLE")}
        className={cn(base, "text-red-500")}
      >
        <Ban size={14} />
      </button>
      <button
        type="button"
        title={`${label} : rétablir les horaires habituels`}
        aria-label={`${label} : rétablir les horaires habituels`}
        disabled={disabled}
        onClick={onClear}
        className={cn(base, "text-gray-500")}
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}

export function AgendaGrid({ week }: { week: AgendaWeek }) {
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  function targetOf(scope: Scope): AvailabilityTarget {
    return { staffMemberId: week.staffMemberId, ...scope };
  }

  function buttonsFor(label: string, scope: Scope) {
    return (
      <RuleButtons
        label={label}
        disabled={pending}
        onSet={(state) => run(() => setAvailability(targetOf(scope), state))}
        onClear={() => run(() => clearAvailability(targetOf(scope)))}
      />
    );
  }

  const hours = week.days[0].hours.map((entry) => entry.hour);
  const morning = hours.filter((hour) => hour < AFTERNOON_START);
  const afternoon = hours.filter((hour) => hour >= AFTERNOON_START);

  function hourRow(hour: number) {
    return (
      <div key={hour} className={GRID_COLUMNS}>
        <div className="pr-2 pt-2 text-right text-xs text-gray-400">
          {String(hour).padStart(2, "0")}h
        </div>
        {week.days.map((day) => {
          const cell = day.hours.find((entry) => entry.hour === hour)!;
          const exception = week.rules.find(
            (rule) =>
              rule.date === day.date &&
              rule.fromHour === hour &&
              rule.toHour === hour + 1,
          );
          const appointments = week.appointments.filter(
            (appointment) =>
              parisDate(appointment.startsAt) === day.date &&
              parisHour(appointment.startsAt) === hour,
          );
          const action = exception
            ? "rétablir l'horaire habituel"
            : cell.available
              ? "rendre indisponible"
              : "rendre disponible";
          const scope: Scope = { scope: "HOUR", date: day.date, hour };

          return (
            <button
              key={day.date}
              type="button"
              disabled={pending}
              title={`${DAY_LABELS[week.days.indexOf(day)]} ${formatDayMonth(day.date)} ${hour}h — cliquer pour ${action}`}
              onClick={() =>
                run(() =>
                  exception
                    ? clearAvailability(targetOf(scope))
                    : setAvailability(
                        targetOf(scope),
                        cell.available ? "INDISPONIBLE" : "DISPONIBLE",
                      ),
                )
              }
              className={cn(
                "flex min-h-10 flex-col gap-0.5 rounded border p-0.5 text-left text-[11px] transition-colors disabled:opacity-60",
                cell.available
                  ? "border-emerald-300 bg-emerald-100 hover:bg-emerald-200"
                  : "border-gray-200 bg-gray-100 hover:bg-gray-200",
                exception && "ring-2 ring-amber-400 ring-offset-1",
              )}
            >
              {appointments.map((appointment) => (
                <span
                  key={appointment.id}
                  className="block truncate rounded bg-blue-600 px-1 text-white"
                  title={`${appointment.serviceName} — ${appointment.citizenEmail}`}
                >
                  {formatTime(appointment.startsAt)} {appointment.serviceName}
                </span>
              ))}
            </button>
          );
        })}
      </div>
    );
  }

  function periodRow(label: string, period: "MORNING" | "AFTERNOON") {
    return (
      <div className={cn(GRID_COLUMNS, "items-center")}>
        <div className="pr-2 text-right text-xs font-medium text-gray-500">
          {label}
        </div>
        {week.days.map((day) => (
          <div key={day.date}>
            {buttonsFor(`${label} du ${formatDayMonth(day.date)}`, {
              scope: "HALF_DAY",
              date: day.date,
              period,
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span className="font-medium">Toute la semaine</span>
        {buttonsFor("Toute la semaine", {
          scope: "WEEK",
          date: week.weekStart,
        })}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[44rem] space-y-1">
          <div className={cn(GRID_COLUMNS, "items-center")}>
            <div />
            {week.days.map((day, index) => (
              <div key={day.date} className="text-center">
                <p className="text-sm font-semibold text-gray-800">
                  {DAY_LABELS[index]} {formatDayMonth(day.date)}
                </p>
                {buttonsFor(`Journée du ${formatDayMonth(day.date)}`, {
                  scope: "DAY",
                  date: day.date,
                })}
              </div>
            ))}
          </div>

          {periodRow("Matin", "MORNING")}
          {morning.map(hourRow)}
          {periodRow("Après-midi", "AFTERNOON")}
          {afternoon.map(hourRow)}
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-1 pt-2 text-xs text-gray-500">
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-emerald-300 bg-emerald-100" />
          Disponible
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-gray-200 bg-gray-100" />
          Indisponible
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded ring-2 ring-amber-400" />
          Exception à cette heure (recliquer pour rétablir)
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-blue-600" />
          Rendez-vous
        </li>
      </ul>
    </div>
  );
}
