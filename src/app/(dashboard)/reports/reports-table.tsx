"use client";

import { updateReportStatus } from "@/app/actions/reports";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/layout/empty-state";
import { StatusBadge } from "@/components/layout/status-badge";
import { PhotoThumbnail } from "@/components/layout/photo-thumbnail";
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
import { formatCompactDateTime } from "@/lib/paris-time";
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
          <TableHead className="w-20">Photo</TableHead>
          <TableHead>Signalement</TableHead>
          <TableHead>Habitant</TableHead>
          <TableHead>Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell label="Photo">
              {report.imageUrl ? (
                <PhotoThumbnail
                  url={report.imageUrl}
                  label={`Voir la photo du signalement : ${report.address}`}
                />
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell label="Signalement" className="max-w-sm">
              <div className="min-w-0 space-y-1">
                <Badge variant="outline">
                  {reportCategoryLabels[report.category]}
                </Badge>
                <p
                  className="break-words font-medium lg:truncate"
                  title={report.address}
                >
                  {report.address}
                </p>
                <p
                  title={report.description}
                  className="line-clamp-2 break-words text-sm text-muted-foreground"
                >
                  {report.description}
                </p>
              </div>
            </TableCell>
            <TableCell label="Habitant">
              <div className="min-w-0">
                <p
                  className="break-words text-sm lg:max-w-44 lg:truncate"
                  title={report.citizen.email}
                >
                  {report.citizen.email}
                </p>
                <p className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatCompactDateTime(report.createdAt)}
                </p>
              </div>
            </TableCell>
            <TableCell label="Statut">
              <div className="flex flex-col items-start gap-1.5 max-lg:items-end">
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
