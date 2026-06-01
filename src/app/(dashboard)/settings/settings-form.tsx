"use client";

import { updateSettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransition } from "react";
import { toast } from "sonner";

export function SettingsForm({ villageName }: { villageName: string }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateSettings(formData);
        toast.success("Paramètres sauvegardés.");
      } catch {
        toast.error("Erreur lors de la sauvegarde.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="village_name">Nom de la commune</Label>
        <Input
          id="village_name"
          name="village_name"
          defaultValue={villageName}
          required
        />
        <p className="text-xs text-gray-500">
          Ce nom est affiché sur la page d&apos;accueil de l&apos;application et
          utilisé pour la météo.
        </p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sauvegarde…" : "Enregistrer"}
      </Button>
    </form>
  );
}
