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
import { UserRound, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

// Le commerçant assigné gère sa propre fiche en autonomie depuis l'appli
// mobile (horaires, photos, notes...) -- le staff garde un droit de
// modération sur le formulaire ci-dessus et peut réassigner/retirer le
// commerçant ici à tout moment. Cf. docs/ROADMAP.md.
export function CommerceManagerSection({
  commerceId,
  initialManager,
}: {
  commerceId: string;
  initialManager: { email: string } | null;
}) {
  const [manager, setManager] = useState(initialManager);
  const [email, setEmail] = useState("");
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleAssign() {
    if (!email.trim()) return;
    startTransition(async () => {
      try {
        await assignCommerceManager(commerceId, email.trim());
        setManager({ email: email.trim() });
        setEmail("");
        toast.success("Commerçant associé.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  function handleUnassign() {
    setConfirmingRemoval(false);
    startTransition(async () => {
      try {
        await unassignCommerceManager(commerceId);
        setManager(null);
        toast.success("Commerçant retiré.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  return (
    <div className="space-y-2 rounded-lg border border-gray-200 p-4">
      <Label>Commerçant associé</Label>
      <p className="text-xs text-gray-500">
        Le compte associé peut modifier lui-même cette fiche (horaires,
        photos, notes...) depuis l&apos;appli. Le staff garde toujours la
        main pour modérer.
      </p>

      {manager ? (
        <div className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <UserRound size={16} className="text-gray-400" />
            {manager.email}
          </div>
          <Dialog open={confirmingRemoval} onOpenChange={setConfirmingRemoval}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setConfirmingRemoval(true)}
            >
              <X size={16} className="text-red-500" />
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Retirer ce commerçant ?</DialogTitle>
                <DialogDescription>
                  &quot;{manager.email}&quot; perdra immédiatement l&apos;accès
                  à la gestion de cette fiche.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmingRemoval(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={pending}
                  onClick={handleUnassign}
                >
                  Retirer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="email du compte citoyen"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={pending || !email.trim()}
            onClick={handleAssign}
          >
            Associer
          </Button>
        </div>
      )}
    </div>
  );
}
