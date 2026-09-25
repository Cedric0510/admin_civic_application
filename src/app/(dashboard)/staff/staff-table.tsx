"use client";

import { deleteStaff, updateStaff } from "@/app/actions/staff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";
import { ConfirmDeleteButton } from "@/components/layout/row-actions";
import { StatusSelect } from "@/components/layout/status-select";
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
import { Pencil, Users } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { StaffMember, StaffRole } from "@/lib/types";

const roleLabels: Record<StaffRole, string> = {
  AGENT: "Agent",
  ADMINISTRATEUR: "Administrateur",
  SUPER_ADMIN: "Super administrateur",
};

const editableRoleLabels: Record<"AGENT" | "ADMINISTRATEUR", string> = {
  AGENT: roleLabels.AGENT,
  ADMINISTRATEUR: roleLabels.ADMINISTRATEUR,
};

export function StaffTable({ staff }: { staff: StaffMember[] }) {
  const [pending, startTransition] = useTransition();
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

  if (staff.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Aucun agent"
        description="Ajoutez les agents de la mairie qui utiliseront ce dashboard."
      />
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
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </TableCell>
              <TableCell>
                {member.role === "SUPER_ADMIN" ? (
                  <Badge variant="outline">{roleLabels[member.role]}</Badge>
                ) : (
                  <StatusSelect
                    value={member.role as "AGENT" | "ADMINISTRATEUR"}
                    options={editableRoleLabels}
                    label={`Rôle de ${member.name}`}
                    disabled={pending}
                    onChange={(role) =>
                      run(
                        () => updateStaff(member.id, { role }),
                        "Rôle mis à jour.",
                      )
                    }
                  />
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(member.createdAt).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Renommer ${member.name}`}
                    title={`Renommer ${member.name}`}
                    onClick={() => startRename(member)}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </Button>
                  <ConfirmDeleteButton
                    label={`Supprimer ${member.name}`}
                    title="Supprimer cet agent ?"
                    description={`« ${member.name} » perdra immédiatement l'accès au dashboard. Cette action est irréversible.`}
                    disabled={member.role === "SUPER_ADMIN"}
                    pending={pending}
                    onConfirm={() =>
                      run(() => deleteStaff(member.id), "Agent supprimé.")
                    }
                  />
                </div>
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
              Ce nom remplace l&apos;adresse e-mail dans les menus du dashboard.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={draftName}
            aria-label="Nouveau nom"
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
