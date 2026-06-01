"use client";

import { deleteService } from "@/app/actions/services";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Service } from "@/lib/types";

export function ServicesTable({ services }: { services: Service[] }) {
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(id: string) {
    setDeletingId(null);
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
      <p className="text-center text-gray-500 py-12 text-sm">
        Aucun service municipal.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Catégorie</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
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
                <span className="text-gray-400 text-sm">—</span>
              )}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {service.phone ?? "—"}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Link
                  href={`/services/${service.id}/edit`}
                  className={buttonVariants({ variant: "ghost", size: "icon" })}
                >
                  <Pencil size={16} />
                </Link>
                <Dialog
                  open={deletingId === service.id}
                  onOpenChange={(open) =>
                    setDeletingId(open ? service.id : null)
                  }
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingId(service.id)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Supprimer le service ?</DialogTitle>
                      <DialogDescription>
                        &quot;{service.name}&quot; sera définitivement supprimé.
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
                        onClick={() => handleDelete(service.id)}
                      >
                        Supprimer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
