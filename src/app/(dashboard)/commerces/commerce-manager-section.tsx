"use client";

import {
  assignCommerceManager,
  unassignCommerceManager,
} from "@/app/actions/commerces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CommerceManager } from "@/lib/types";
import { UserRound, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

// Les comptes associés gèrent la fiche en autonomie depuis l'appli mobile
// (horaires, photos, notes...) -- le staff garde un droit de modération sur
// le formulaire ci-dessus et peut ajouter ou retirer des personnes ici à
// tout moment.
export function CommerceManagerSection({
  commerceId,
  managers,
}: {
  commerceId: string;
  managers: CommerceManager[];
}) {
  const [email, setEmail] = useState("");
  const [toRemove, setToRemove] = useState<CommerceManager | null>(null);
  const [pending, startTransition] = useTransition();

  function fail(error: unknown) {
    toast.error(
      error instanceof Error ? error.message : "Une erreur est survenue.",
    );
  }

  function handleAdd() {
    if (!email.trim()) return;
    startTransition(async () => {
      try {
        await assignCommerceManager(commerceId, email.trim());
        setEmail("");
        toast.success("Personne associée au commerce.");
      } catch (error) {
        fail(error);
      }
    });
  }

  function handleRemove() {
    const manager = toRemove;
    if (!manager) return;
    setToRemove(null);
    startTransition(async () => {
      try {
        await unassignCommerceManager(commerceId, manager.id);
        toast.success("Personne retirée du commerce.");
      } catch (error) {
        fail(error);
      }
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 p-4">
      <div className="space-y-1">
        <Label>Personnes qui gèrent ce commerce</Label>
        <p className="text-xs text-gray-500">
          Chaque compte associé peut modifier lui-même cette fiche (horaires,
          photos, notes...) depuis l&apos;appli. La personne doit d&apos;abord
          avoir créé son compte dans l&apos;appli. Le staff garde toujours la
          main pour modérer.
        </p>
      </div>

      {managers.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aucun compte associé pour l&apos;instant.
        </p>
      ) : (
        <ul className="space-y-2">
          {managers.map((manager) => (
            <li
              key={manager.id}
              className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm text-gray-700">
                <UserRound size={16} className="text-gray-400" />
                {manager.email}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Retirer ${manager.email}`}
                disabled={pending}
                onClick={() => setToRemove(manager)}
              >
                <X size={16} className="text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="e-mail du compte à ajouter"
          aria-label="E-mail du compte à ajouter"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={pending || !email.trim()}
          onClick={handleAdd}
        >
          Ajouter
        </Button>
      </div>

      <Dialog
        open={toRemove !== null}
        onOpenChange={(open) => !open && setToRemove(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirer cette personne ?</DialogTitle>
            <DialogDescription>
              {toRemove?.email} perdra immédiatement l&apos;accès à la gestion
              de cette fiche. Les autres personnes associées ne changent pas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setToRemove(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={handleRemove}
            >
              Retirer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
