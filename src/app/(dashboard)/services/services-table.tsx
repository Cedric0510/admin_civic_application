"use client";

import { deleteService } from "@/app/actions/services";
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
import { Building2, Pencil } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import type { Service } from "@/lib/types";

export function ServicesTable({ services }: { services: Service[] }) {
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteService(id);
        toast.success("Service supprimé.");
      } catch {
        toast.error("Erreur lors de la suppression.");
      }
    });
  }

  if (services.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Aucun service municipal"
        description="Ajoutez les services de la mairie pour que les habitants les retrouvent et prennent rendez-vous."
        action={
          <Link href="/services/new" className={buttonVariants()}>
            Nouveau service
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
          <TableHead className="w-28 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => (
          <TableRow key={service.id}>
            <TableCell className="font-medium">{service.name}</TableCell>
            <TableCell>
              {service.category ? (
                <Badge variant="outline">{service.category}</Badge>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {service.phone ?? "—"}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <IconLink
                  href={`/services/${service.id}/edit`}
                  label={`Modifier ${service.name}`}
                  icon={Pencil}
                />
                <ConfirmDeleteButton
                  label={`Supprimer ${service.name}`}
                  title="Supprimer le service ?"
                  description={`« ${service.name} » sera définitivement supprimé.`}
                  pending={pending}
                  onConfirm={() => handleDelete(service.id)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
