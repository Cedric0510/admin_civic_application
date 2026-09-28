"use client";

import { deleteSuperAdmin } from "@/app/actions/staff";
import { EmptyState } from "@/components/layout/empty-state";
import { ConfirmDeleteButton } from "@/components/layout/row-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldCheck } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import type { StaffMember } from "@/lib/types";

export function SuperAdminsTable({ admins }: { admins: StaffMember[] }) {
  const [pending, startTransition] = useTransition();

  function revoke(admin: StaffMember) {
    startTransition(async () => {
      try {
        await deleteSuperAdmin(admin.id);
        toast.success("Super-administrateur révoqué.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  if (admins.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Aucun super-administrateur"
        description="Créez le premier compte ayant accès à toute la plateforme."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Depuis</TableHead>
          <TableHead className="w-16 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {admins.map((admin) => (
          <TableRow key={admin.id}>
            <TableCell label="Nom">
              <div className="min-w-0">
                <p className="font-medium">{admin.name}</p>
                <p className="break-words text-xs text-muted-foreground">
                  {admin.email}
                </p>
              </div>
            </TableCell>
            <TableCell
              label="Depuis"
              className="text-sm text-muted-foreground"
            >
              {new Date(admin.createdAt).toLocaleDateString("fr-FR")}
            </TableCell>
            <TableCell className="text-right">
              <ConfirmDeleteButton
                label={`Révoquer ${admin.name}`}
                title="Révoquer ce super-administrateur ?"
                description={`« ${admin.name} » perdra immédiatement son accès complet à la plateforme. Cette action est irréversible.`}
                pending={pending}
                onConfirm={() => revoke(admin)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
