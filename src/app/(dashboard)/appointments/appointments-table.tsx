"use client";

import {
  deleteAppointment,
  updateAppointmentStatus,
} from "@/app/actions/appointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";
import { ConfirmDeleteButton } from "@/components/layout/row-actions";
import { StatusBadge } from "@/components/layout/status-badge";
import { StatusSelect } from "@/components/layout/status-select";
import type { Tone } from "@/components/stats/tone";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarDays } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/paris-time";
import type { Appointment, AppointmentStatus } from "@/lib/types";

const statusLabels: Record<AppointmentStatus, string> = {
  DEMANDE: "Demandé",
  CONFIRME: "Confirmé",
  ANNULE: "Annulé",
};

const statusTones: Record<AppointmentStatus, Tone> = {
  DEMANDE: "warn",
  CONFIRME: "good",
  ANNULE: "neutral",
};

type Props = {
  appointments: Appointment[];
  services: string[];
  currentService?: string;
  currentDate?: string;
};

export function AppointmentsTable({
  appointments,
  services,
  currentService,
  currentDate,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams();
    if (key !== "service" && currentService) params.set("service", currentService);
    if (key !== "date" && currentDate) params.set("date", currentDate);
    if (value) params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteAppointment(id);
        toast.success("Rendez-vous supprimé.");
      } catch {
        toast.error("Erreur lors de la suppression.");
      }
    });
  }

  function handleStatusChange(id: string, status: AppointmentStatus) {
    startTransition(async () => {
      try {
        await updateAppointmentStatus(id, status);
        toast.success("Statut mis à jour.");
      } catch {
        toast.error("Erreur lors de la modification.");
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <NativeSelect
          aria-label="Filtrer par service"
          className="w-auto min-w-48"
          value={currentService ?? ""}
          onChange={(e) => applyFilter("service", e.target.value)}
        >
          <option value="">Tous les services</option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>

        <Input
          type="date"
          aria-label="Filtrer par jour"
          className="w-auto"
          value={currentDate ?? ""}
          onChange={(e) => applyFilter("date", e.target.value)}
        />

        {(currentService || currentDate) && (
          <Button variant="ghost" onClick={clearFilters}>
            Réinitialiser
          </Button>
        )}
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Aucun rendez-vous"
          description={
            currentService || currentDate
              ? "Aucun rendez-vous ne correspond à ces filtres."
              : "Les demandes de rendez-vous des habitants apparaîtront ici."
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Habitant</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-16 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appt) => (
              <TableRow key={appt.id}>
                <TableCell className="font-medium">{appt.citizen.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{appt.service.name}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground capitalize">
                  {formatDateTime(appt.startsAt)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {appt.agent?.name ?? "—"}
                </TableCell>
                <TableCell
                  title={appt.message ?? undefined}
                  className="max-w-xs truncate text-sm text-muted-foreground"
                >
                  {appt.message ?? "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusBadge tone={statusTones[appt.status]}>
                      {statusLabels[appt.status]}
                    </StatusBadge>
                    <StatusSelect
                      value={appt.status}
                      options={statusLabels}
                      label={`Statut du rendez-vous de ${appt.citizen.email}`}
                      disabled={pending}
                      onChange={(status) => handleStatusChange(appt.id, status)}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <ConfirmDeleteButton
                    label={`Supprimer le rendez-vous de ${appt.citizen.email}`}
                    title="Supprimer le rendez-vous ?"
                    description={`Le rendez-vous de ${appt.citizen.email} sera définitivement supprimé.`}
                    pending={pending}
                    onConfirm={() => handleDelete(appt.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
