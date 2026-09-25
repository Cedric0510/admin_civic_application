"use client";

import { deleteCommerce } from "@/app/actions/commerces";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";
import { ConfirmDeleteButton, IconLink } from "@/components/layout/row-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Store } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import type { Commerce } from "@/lib/types";

export function CommercesTable({ commerces }: { commerces: Commerce[] }) {
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteCommerce(id);
        toast.success("Commerce supprimé.");
      } catch {
        toast.error("Erreur lors de la suppression.");
      }
    });
  }

  if (commerces.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="Aucun commerce"
        description="Référencez les commerces de la commune pour les faire connaître aux habitants."
        action={
          <Link href="/commerces/new" className={buttonVariants()}>
            Nouveau commerce
          </Link>
        }
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Catégorie</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="w-28 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {commerces.map((commerce) => (
          <TableRow key={commerce.id}>
            <TableCell label="Nom" className="font-medium">
              {commerce.name}
            </TableCell>
            <TableCell label="Catégorie">
              {commerce.category ? (
                <Badge variant="outline">{commerce.category}</Badge>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell
              label="Téléphone"
              className="text-sm text-muted-foreground"
            >
              {commerce.phone ?? "—"}
            </TableCell>
            <TableCell
              label="Notes"
              className="max-w-48 truncate text-sm text-muted-foreground"
            >
              {commerce.notes ?? "—"}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <IconLink
                  href={`/commerces/${commerce.id}/edit`}
                  label={`Modifier ${commerce.name}`}
                  icon={Pencil}
                />
                <ConfirmDeleteButton
                  label={`Supprimer ${commerce.name}`}
                  title="Supprimer ce commerce ?"
                  description={`« ${commerce.name} » sera définitivement supprimé.`}
                  pending={pending}
                  onConfirm={() => handleDelete(commerce.id)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
