"use client";

import { provisionCommune } from "@/app/actions/superadmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export function CommuneProvisionForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await provisionCommune(formData);
        toast.success("Commune et compte administrateur créés.");
        router.push("/superadmin");
      } catch (error) {
        // Message potentiellement long ici (cf. provisionCommune) -- un
        // échec partiel (commune créée, admin non créé) doit être visible,
        // pas remplacé par un message générique.
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Commune</h2>
        <div className="space-y-1">
          <Label htmlFor="communeName">Nom *</Label>
          <Input id="communeName" name="communeName" placeholder="Bessan" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="communeSlug">Identifiant (slug) *</Label>
          <Input
            id="communeSlug"
            name="communeSlug"
            placeholder="bessan"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Minuscules, chiffres et tirets uniquement (ex. ma-commune)."
            required
          />
          <p className="text-xs text-gray-500">
            Minuscules, chiffres et tirets uniquement -- utilisé par
            l&apos;app mobile pour identifier la commune.
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">
          Premier compte administrateur
        </h2>
        <div className="space-y-1">
          <Label htmlFor="adminName">Nom *</Label>
          <Input
            id="adminName"
            name="adminName"
            placeholder="Marie Durand"
            minLength={2}
            maxLength={100}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="adminEmail">Email *</Label>
          <Input
            id="adminEmail"
            name="adminEmail"
            type="email"
            placeholder="mairie@bessan.fr"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="adminPassword">Mot de passe *</Label>
          <Input
            id="adminPassword"
            name="adminPassword"
            type="password"
            minLength={8}
            required
          />
          <p className="text-xs text-gray-500">8 caractères minimum.</p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Provisionner"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
