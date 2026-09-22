"use client";

import { deleteCommerce } from "@/app/actions/commerces";
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
import type { Commerce } from "@/lib/types";

export function CommercesTable({ commerces }: { commerces: Commerce[] }) {
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(id: string) {
    setDeletingId(null);
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
      <p className="text-center text-gray-500 py-12 text-sm">
        Aucun commerce.
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
          <TableHead>Notes</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {commerces.map((commerce) => (
          <TableRow key={commerce.id}>
            <TableCell className="font-medium">{commerce.name}</TableCell>
            <TableCell>
              {commerce.category ? (
                <Badge variant="outline">{commerce.category}</Badge>
              ) : (
                <span className="text-gray-400 text-sm">—</span>
              )}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {commerce.phone ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-gray-500 max-w-48 truncate">
              {commerce.notes ?? "—"}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Link
                  href={`/commerces/${commerce.id}/edit`}
                  className={buttonVariants({ variant: "ghost", size: "icon" })}
                >
                  <Pencil size={16} />
                </Link>
                <Dialog
                  open={deletingId === commerce.id}
                  onOpenChange={(open) =>
                    setDeletingId(open ? commerce.id : null)
                  }
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingId(commerce.id)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Supprimer ce commerce ?</DialogTitle>
                      <DialogDescription>
                        &quot;{commerce.name}&quot; sera définitivement
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
                        onClick={() => handleDelete(commerce.id)}
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
