"use client";

import { deleteStaff, updateStaffRole } from "@/app/actions/staff";
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
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { StaffMember, StaffRole } from "@/lib/types";

const roleLabels: Record<StaffRole, string> = {
  AGENT: "Agent",
  ADMINISTRATEUR: "Administrateur",
  SUPER_ADMIN: "Super administrateur",
};

// SUPER_ADMIN volontairement absent : civic_api refuse de toute façon
// d'accorder ce rôle à quiconque n'est pas déjà super-admin (voir
// StaffService.update), ce sélecteur n'a donc pas de raison de le proposer.
const editableRoles: StaffRole[] = ["AGENT", "ADMINISTRATEUR"];

export function StaffTable({ staff }: { staff: StaffMember[] }) {
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleRoleChange(id: string, role: StaffRole) {
    startTransition(async () => {
      try {
        await updateStaffRole(id, role);
        toast.success("Rôle mis à jour.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  function handleDelete(id: string) {
    setDeletingId(null);
    startTransition(async () => {
      try {
        await deleteStaff(id);
        toast.success("Agent supprimé.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  if (staff.length === 0) {
    return (
      <p className="text-center text-gray-500 py-12 text-sm">Aucun agent.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Depuis</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {staff.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="font-medium">{member.email}</TableCell>
            <TableCell>
              {member.role === "SUPER_ADMIN" ? (
                <Badge variant="outline">{roleLabels[member.role]}</Badge>
              ) : (
                <select
                  value={member.role}
                  disabled={pending}
                  onChange={(e) =>
                    handleRoleChange(member.id, e.target.value as StaffRole)
                  }
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {editableRoles.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>
              )}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {new Date(member.createdAt).toLocaleDateString("fr-FR")}
            </TableCell>
            <TableCell className="text-right">
              <Dialog
                open={deletingId === member.id}
                onOpenChange={(open) => setDeletingId(open ? member.id : null)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={member.role === "SUPER_ADMIN"}
                  onClick={() => setDeletingId(member.id)}
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Supprimer cet agent ?</DialogTitle>
                    <DialogDescription>
                      &quot;{member.email}&quot; perdra immédiatement l&apos;accès
                      au dashboard. Cette action est irréversible.
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
                      onClick={() => handleDelete(member.id)}
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
  );
}
