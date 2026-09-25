"use client";

import { updateReportStatus } from "@/app/actions/reports";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/layout/empty-state";
import { StatusBadge } from "@/components/layout/status-badge";
import { StatusSelect } from "@/components/layout/status-select";
import type { Tone } from "@/components/stats/tone";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Megaphone } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { reportCategoryLabels } from "@/lib/report-labels";
import type { Report, ReportStatus } from "@/lib/types";

const statusLabels: Record<ReportStatus, string> = {
  NOUVEAU: "Nouveau",
  EN_COURS: "En cours",
  TRAITE: "Traité",
};

const statusTones: Record<ReportStatus, Tone> = {
  NOUVEAU: "warn",
  EN_COURS: "brand",
  TRAITE: "good",
};

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
      <EmptyState
        icon={Megaphone}
        title="Aucun signalement"
        description="Les problèmes signalés par les habitants depuis l'application apparaîtront ici."
      />
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
          <TableHead>Habitant</TableHead>
          <TableHead>Reçu le</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <StatusBadge tone={statusTones[report.status]}>
                  {statusLabels[report.status]}
                </StatusBadge>
                <StatusSelect
                  value={report.status}
                  options={statusLabels}
                  label={`Statut du signalement : ${report.address}`}
                  disabled={pending}
                  onChange={(status) => handleStatusChange(report.id, status)}
                />
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {reportCategoryLabels[report.category]}
              </Badge>
            </TableCell>
            <TableCell
              title={report.address}
              className="max-w-[200px] truncate text-sm text-muted-foreground"
            >
              {report.address}
            </TableCell>
            <TableCell
              title={report.description}
              className="max-w-xs truncate text-sm text-muted-foreground"
            >
              {report.description}
            </TableCell>
            <TableCell>
              {report.imageUrl ? (
                <a href={report.imageUrl} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element -- miniature d'une image hébergée par civic_api, pas d'optimisation Next.js nécessaire. */}
                  <img
                    src={report.imageUrl}
                    alt="Photo du signalement"
                    className="size-10 rounded-lg border border-border object-cover"
                  />
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {report.citizen.email}
            </TableCell>
            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
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
