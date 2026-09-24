"use client";

import { updateReportStatus } from "@/app/actions/reports";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransition } from "react";
import { toast } from "sonner";
import type { Report, ReportCategory, ReportStatus } from "@/lib/types";

const categoryLabels: Record<ReportCategory, string> = {
  VOIRIE: "Voirie",
  ECLAIRAGE: "Éclairage",
  PROPRETE: "Propreté",
  ESPACES_VERTS: "Espaces verts",
  AUTRE: "Autre",
};

const statusLabels: Record<ReportStatus, string> = {
  NOUVEAU: "Nouveau",
  EN_COURS: "En cours",
  TRAITE: "Traité",
};

const statusBadgeVariant: Record<
  ReportStatus,
  "destructive" | "secondary" | "outline"
> = {
  NOUVEAU: "destructive",
  EN_COURS: "secondary",
  TRAITE: "outline",
};

const statusOptions: ReportStatus[] = ["NOUVEAU", "EN_COURS", "TRAITE"];

export function ReportsTable({ reports }: { reports: Report[] }) {
  const [pending, startTransition] = useTransition();

  function handleStatusChange(id: string, status: ReportStatus) {
    startTransition(async () => {
      try {
        await updateReportStatus(id, status);
        toast.success("Statut mis à jour.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  if (reports.length === 0) {
    return (
      <p className="text-center text-gray-500 py-12 text-sm">
        Aucun signalement.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Statut</TableHead>
          <TableHead>Catégorie</TableHead>
          <TableHead>Adresse</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Photo</TableHead>
          <TableHead>Citoyen</TableHead>
          <TableHead>Reçu le</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Badge variant={statusBadgeVariant[report.status]}>
                  {statusLabels[report.status]}
                </Badge>
                <select
                  value={report.status}
                  disabled={pending}
                  onChange={(e) =>
                    handleStatusChange(
                      report.id,
                      e.target.value as ReportStatus,
                    )
                  }
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {categoryLabels[report.category]}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">
              {report.address}
            </TableCell>
            <TableCell className="text-sm text-gray-500 max-w-xs truncate">
              {report.description}
            </TableCell>
            <TableCell>
              {report.imageUrl ? (
                <a href={report.imageUrl} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element -- miniature d'une image hébergée par civic_api, pas d'optimisation Next.js nécessaire. */}
                  <img
                    src={report.imageUrl}
                    alt="Photo du signalement"
                    className="h-10 w-10 rounded-md object-cover border border-gray-200"
                  />
                </a>
              ) : (
                <span className="text-sm text-gray-400">—</span>
              )}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {report.citizen.email}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {new Date(report.createdAt).toLocaleString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
