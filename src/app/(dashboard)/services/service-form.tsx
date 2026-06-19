"use client";

import { createService, updateService } from "@/app/actions/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { Service } from "@/lib/types";

export function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (service) {
          await updateService(service.id, formData);
        } else {
          await createService(formData);
        }
        toast.success(service ? "Service mis à jour." : "Service créé.");
        router.push("/services");
      } catch {
        toast.error("Une erreur est survenue.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Nom du service *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={service?.name}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="category">Catégorie</Label>
        <Input
          id="category"
          name="category"
          defaultValue={service?.category ?? ""}
          placeholder="ex. Administration, Technique, Culture…"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={service?.description ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={service?.phone ?? ""}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="hours">Horaires</Label>
          <Input
            id="hours"
            name="hours"
            defaultValue={service?.hours ?? ""}
            placeholder="ex. Lun-Ven 9h-17h"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          name="address"
          defaultValue={service?.address ?? ""}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Sauvegarde…" : service ? "Enregistrer" : "Créer"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
