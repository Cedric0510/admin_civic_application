"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api/client";
import type {
  AgendaWeek,
  AvailabilityScope,
  AvailabilityState,
  DayPeriod,
  WorkingHoursRange,
} from "@/lib/types";

export type AvailabilityTarget = {
  staffMemberId: string;
  scope: AvailabilityScope;
  date: string;
  period?: DayPeriod;
  hour?: number;
};

function toQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value));
  }
  return query.toString();
}

export async function getAgendaWeek(
  weekStart: string,
  staffMemberId: string,
): Promise<AgendaWeek> {
  return api.get<AgendaWeek>(
    `/agenda/week?${toQuery({ weekStart, staffMemberId })}`,
  );
}

export async function setAvailability(
  target: AvailabilityTarget,
  state: AvailabilityState,
) {
  await api.put("/agenda/rules", { ...target, state });
  revalidatePath("/agenda");
}

export async function clearAvailability(target: AvailabilityTarget) {
  await api.delete(`/agenda/rules?${toQuery(target)}`);
  revalidatePath("/agenda");
}

export async function saveWorkingHours(
  staffMemberId: string,
  hours: WorkingHoursRange[],
) {
  await api.put("/agenda/working-hours", { staffMemberId, hours });
  revalidatePath("/agenda");
}
