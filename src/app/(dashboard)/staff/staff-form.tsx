"use client";

import { createStaff } from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export function StaffForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createStaff(formData);
        toast.success("Agent créé.");
        router.push("/staff");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Mot de passe *</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
        />
        <p className="text-xs text-gray-500">8 caractères minimum.</p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="role">Rôle *</Label>
        <select
          id="role"
          name="role"
          required
          defaultValue="AGENT"
          className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="AGENT">Agent</option>
          <option value="ADMINISTRATEUR">Administrateur</option>
        </select>
        <p className="text-xs text-gray-500">
          Un administrateur peut à son tour gérer les agents et les
          paramètres de la commune.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
