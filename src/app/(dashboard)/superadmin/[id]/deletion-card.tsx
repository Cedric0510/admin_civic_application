"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteCommune } from "@/app/actions/superadmin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DeletionCard({
  communeId,
  communeName,
  suspended,
}: {
  communeId: string;
  communeName: string;
  suspended: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function remove() {
    setConfirming(false);
    startTransition(async () => {
      try {
        await deleteCommune(communeId);
        toast.success(`« ${communeName} » a été supprimée.`);
        router.push("/superadmin");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600">
          <Trash2 size={20} aria-hidden="true" />
        </span>
        <div>
          <p className="font-medium text-slate-900">Supprimer cette commune</p>
          <p className="text-sm text-slate-500">
            {suspended
              ? "Définitif : la commune, ses habitants, son personnel et tout son contenu seront effacés. Réservé à une commune créée par erreur."
              : "Suspendez d'abord l'accès de la commune pour pouvoir la supprimer."}
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="destructive"
        disabled={!suspended || pending}
        onClick={() => setConfirming(true)}
      >
        Supprimer
      </Button>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer « {communeName} » ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible : la commune, ses habitants, son
              personnel, ses actualités, sondages et tout le reste de son
              contenu seront définitivement effacés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirming(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={remove}
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
