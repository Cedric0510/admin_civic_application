"use client";

import { useState, useTransition } from "react";
import { PauseCircle, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { setCommuneSuspended } from "@/app/actions/superadmin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SuspensionCard({
  communeId,
  communeName,
  suspendedAt,
}: {
  communeId: string;
  communeName: string;
  suspendedAt: string | null;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const suspended = suspendedAt !== null;

  function apply(next: boolean) {
    setConfirming(false);
    startTransition(async () => {
      try {
        await setCommuneSuspended(communeId, next);
        toast.success(next ? "Accès suspendu." : "Accès réactivé.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl ${suspended ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}
        >
          {suspended ? (
            <PauseCircle size={20} aria-hidden="true" />
          ) : (
            <PlayCircle size={20} aria-hidden="true" />
          )}
        </span>
        <div>
          <p className="font-medium text-slate-900">
            {suspended ? "Accès suspendu" : "Accès actif"}
          </p>
          <p className="text-sm text-slate-500">
            {suspended
              ? `Depuis le ${new Date(suspendedAt).toLocaleDateString("fr-FR")} : le personnel de la commune ne peut plus se connecter au dashboard. Les habitants continuent d'utiliser l'application.`
              : "Le personnel de la commune peut se connecter au dashboard."}
          </p>
        </div>
      </div>

      {suspended ? (
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => apply(false)}
        >
          Réactiver l&apos;accès
        </Button>
      ) : (
        <Button
          type="button"
          variant="destructive"
          disabled={pending}
          onClick={() => setConfirming(true)}
        >
          Suspendre l&apos;accès
        </Button>
      )}

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspendre l&apos;accès de {communeName} ?</DialogTitle>
            <DialogDescription>
              Le personnel de la commune sera déconnecté immédiatement et ne
              pourra plus se connecter au dashboard. Les données sont
              conservées, l&apos;application des habitants continue de
              fonctionner, et vous pouvez réactiver l&apos;accès à tout moment.
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
              onClick={() => apply(true)}
            >
              Suspendre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
