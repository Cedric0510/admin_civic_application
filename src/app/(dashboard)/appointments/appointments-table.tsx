"use client";

import { deleteAppointment } from "@/app/actions/appointments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Appointment } from "@/lib/types";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    setDeletingId(null);
    startTransition(async () => {
      try {
        await deleteAppointment(id);
        toast.success("Rendez-vous supprimé.");
      } catch {
        toast.error("Erreur lors de la suppression.");
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 p-4 border-b border-gray-100">
        <select
          className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white"
          value={currentService ?? ""}
          onChange={(e) => applyFilter("service", e.target.value)}
        >
          <option value="">Tous les services</option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white"
          value={currentDate ?? ""}
          onChange={(e) => applyFilter("date", e.target.value)}
        />

        {(currentService || currentDate) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Réinitialiser
          </Button>
        )}
      </div>

      {appointments.length === 0 ? (
        <p className="text-center text-gray-500 py-12 text-sm">
          Aucun rendez-vous.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Citoyen</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-16 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appt) => (
              <TableRow key={appt.id}>
                <TableCell>
                  <p className="font-medium">{appt.name}</p>
                  <p className="text-xs text-gray-400">{appt.email}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{appt.service}</Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(appt.date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                  {appt.message ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Dialog
                    open={deletingId === appt.id}
                    onOpenChange={(open) =>
                      setDeletingId(open ? appt.id : null)
                    }
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingId(appt.id)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Supprimer le rendez-vous ?</DialogTitle>
                        <DialogDescription>
                          Le rendez-vous de {appt.name} sera définitivement
                          supprimé.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDeletingId(null)}
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={pending}
                          onClick={() => handleDelete(appt.id)}
                        >
                          Supprimer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
