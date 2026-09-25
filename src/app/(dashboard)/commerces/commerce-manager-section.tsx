"use client";

import {
  assignCommerceManager,
  cancelCommerceInvitation,
  unassignCommerceManager,
} from "@/app/actions/commerces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatShortDate } from "@/lib/paris-time";
import type {
  AddManagerResult,
  CommerceInvitation,
  CommerceManager,
} from "@/lib/types";
import { Mail, UserRound, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

// Les comptes associés gèrent la fiche en autonomie depuis l'appli mobile
// (horaires, photos, notes...) -- le staff garde un droit de modération sur
// le formulaire ci-dessus et peut ajouter ou retirer des personnes ici à
// tout moment.
function outcomeMessage(result: AddManagerResult, resent: boolean): string {
  if (result.status === "linked") {
    return "Cette personne a déjà un compte : elle est associée au commerce.";
  }
  return resent
    ? `Invitation renvoyée à ${result.invitation.email}.`
    : `Invitation envoyée à ${result.invitation.email}.`;
}

export function CommerceManagerSection({
  commerceId,
  managers,
  invitations,
}: {
  commerceId: string;
  managers: CommerceManager[];
  invitations: CommerceInvitation[];
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
        const result = await assignCommerceManager(commerceId, email.trim());
        setEmail("");
        toast.success(outcomeMessage(result, false));
      } catch (error) {
        fail(error);
      }
    });
  }

  function handleResend(invitation: CommerceInvitation) {
    startTransition(async () => {
      try {
        const result = await assignCommerceManager(commerceId, invitation.email);
        toast.success(outcomeMessage(result, true));
      } catch (error) {
        fail(error);
      }
    });
  }

  function handleCancelInvitation(invitation: CommerceInvitation) {
    startTransition(async () => {
      try {
        await cancelCommerceInvitation(commerceId, invitation.id);
        toast.success("Invitation annulée.");
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
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Si la personne a déjà un compte, elle est associée tout de suite ;
        sinon elle reçoit par e-mail une invitation pour créer son compte.
      </p>

      {managers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune personne associée pour l&apos;instant.
        </p>
      ) : (
        <ul className="space-y-2">
          {managers.map((manager) => (
            <li
              key={manager.id}
              className="flex items-center justify-between gap-3 rounded-md bg-muted/60 px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm text-foreground">
                <UserRound size={16} className="text-muted-foreground" />
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

      {invitations.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Invitations en attente
          </p>
          <ul className="space-y-2">
            {invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex items-center justify-between gap-3 rounded-md border border-dashed border-border px-3 py-2"
              >
                <span className="min-w-0 space-y-0.5">
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <Mail size={16} className="shrink-0 text-muted-foreground" />
                    <span className="truncate">{invitation.email}</span>
                  </span>
                  <span className="block pl-6 text-xs text-muted-foreground">
                    Envoyée le {formatShortDate(invitation.sentAt)}, valable
                    jusqu&apos;au {formatShortDate(invitation.expiresAt)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Renvoyer l'invitation à ${invitation.email}`}
                    disabled={pending}
                    onClick={() => handleResend(invitation)}
                  >
                    Renvoyer
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Annuler l'invitation de ${invitation.email}`}
                    disabled={pending}
                    onClick={() => handleCancelInvitation(invitation)}
                  >
                    <X size={16} className="text-red-500" />
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="e-mail de la personne à ajouter"
          aria-label="E-mail de la personne à ajouter"
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
