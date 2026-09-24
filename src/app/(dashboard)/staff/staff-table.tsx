"use client";

import { deleteStaff, updateStaff } from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  const [renaming, setRenaming] = useState<StaffMember | null>(null);
  const [draftName, setDraftName] = useState("");

  function run(action: () => Promise<void>, success: string) {
    startTransition(async () => {
      try {
        await action();
        toast.success(success);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  function startRename(member: StaffMember) {
    setDraftName(member.name);
    setRenaming(member);
  }

  function handleRename() {
    if (!renaming) return;
    const target = renaming;
    setRenaming(null);
    run(() => updateStaff(target.id, { name: draftName }), "Nom mis à jour.");
  }

  function handleDelete(id: string) {
    setDeletingId(null);
    run(() => deleteStaff(id), "Agent supprimé.");
  }

  if (staff.length === 0) {
    return (
      <p className="text-center text-gray-500 py-12 text-sm">Aucun agent.</p>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Depuis</TableHead>
            <TableHead className="w-28 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <p className="font-medium">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </TableCell>
              <TableCell>
                {member.role === "SUPER_ADMIN" ? (
                  <Badge variant="outline">{roleLabels[member.role]}</Badge>
                ) : (
                  <select
                    value={member.role}
                    disabled={pending}
                    onChange={(e) =>
                      run(
                        () =>
                          updateStaff(member.id, {
                            role: e.target.value as StaffRole,
                          }),
                        "Rôle mis à jour.",
                      )
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
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Renommer ${member.name}`}
                  onClick={() => startRename(member)}
                >
                  <Pencil size={16} className="text-gray-500" />
                </Button>
                <Dialog
                  open={deletingId === member.id}
                  onOpenChange={(open) =>
                    setDeletingId(open ? member.id : null)
                  }
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Supprimer ${member.name}`}
                    disabled={member.role === "SUPER_ADMIN"}
                    onClick={() => setDeletingId(member.id)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Supprimer cet agent ?</DialogTitle>
                      <DialogDescription>
                        &quot;{member.name}&quot; perdra immédiatement
                        l&apos;accès au dashboard. Cette action est
                        irréversible.
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

      <Dialog
        open={renaming !== null}
        onOpenChange={(open) => {
          if (!open) setRenaming(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renommer</DialogTitle>
            <DialogDescription>
              Ce nom remplace l&apos;email dans les menus du dashboard.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={draftName}
            minLength={2}
            maxLength={100}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draftName.trim().length >= 2) {
                handleRename();
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenaming(null)}>
              Annuler
            </Button>
            <Button
              disabled={pending || draftName.trim().length < 2}
              onClick={handleRename}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
