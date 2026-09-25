"use client";

import { saveWorkingHours } from "@/app/actions/agenda";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { WorkingHoursRange } from "@/lib/types";

const WEEKDAYS = [
  { weekday: 1, label: "Lundi" },
  { weekday: 2, label: "Mardi" },
  { weekday: 3, label: "Mercredi" },
  { weekday: 4, label: "Jeudi" },
  { weekday: 5, label: "Vendredi" },
  { weekday: 6, label: "Samedi" },
  { weekday: 7, label: "Dimanche" },
];
const HOUR_CHOICES = Array.from({ length: 17 }, (_, index) => index + 6);
const NEW_RANGE = { startHour: 9, endHour: 12 };

const selectClass =
  "h-9 rounded-lg border border-input bg-card px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function WorkingHoursForm({
  staffMemberId,
  workingHours,
}: {
  staffMemberId: string;
  workingHours: WorkingHoursRange[];
}) {
  const [ranges, setRanges] = useState(workingHours);
  const [pending, startTransition] = useTransition();

  function update(target: WorkingHoursRange, changes: Partial<WorkingHoursRange>) {
    setRanges((current) =>
      current.map((range) =>
        range === target ? { ...range, ...changes } : range,
      ),
    );
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveWorkingHours(staffMemberId, ranges);
        toast.success("Horaires habituels enregistrés.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {WEEKDAYS.map(({ weekday, label }) => {
          const dayRanges = ranges.filter((range) => range.weekday === weekday);
          return (
            <div key={weekday} className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setRanges((current) => [
                      ...current,
                      { weekday, ...NEW_RANGE },
                    ])
                  }
                >
                  <Plus size={14} />
                  Plage
                </Button>
              </div>
              {dayRanges.length === 0 ? (
                <p className="text-xs text-muted-foreground">Pas de rendez-vous.</p>
              ) : (
                <ul className="space-y-2">
                  {dayRanges.map((range, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <select
                        className={selectClass}
                        value={range.startHour}
                        onChange={(e) =>
                          update(range, { startHour: Number(e.target.value) })
                        }
                      >
                        {HOUR_CHOICES.slice(0, -1).map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}h
                          </option>
                        ))}
                      </select>
                      <span>à</span>
                      <select
                        className={selectClass}
                        value={range.endHour}
                        onChange={(e) =>
                          update(range, { endHour: Number(e.target.value) })
                        }
                      >
                        {HOUR_CHOICES.slice(1).map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}h
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setRanges((current) =>
                            current.filter((candidate) => candidate !== range),
                          )
                        }
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      <Button type="button" disabled={pending} onClick={handleSave}>
        {pending ? "Enregistrement…" : "Enregistrer les horaires"}
      </Button>
    </div>
  );
}
