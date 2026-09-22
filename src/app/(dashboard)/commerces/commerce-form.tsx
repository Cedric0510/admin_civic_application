"use client";

import { createCommerce, updateCommerce } from "@/app/actions/commerces";
import { uploadImage } from "@/app/actions/uploads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { Commerce } from "@/lib/types";

export function CommerceForm({ commerce }: { commerce?: Commerce }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const imageFile = formData.get("image_file") as File | null;
        formData.delete("image_file");
        // Pas de nouveau fichier choisi : on ne fixe pas image_url du tout —
        // civic_api (PATCH) laisse alors la valeur existante inchangée.
        if (imageFile && imageFile.size > 0) {
          const url = await uploadImage(imageFile);
          formData.set("image_url", url);
        }

        if (commerce) {
          await updateCommerce(commerce.id, formData);
        } else {
          await createCommerce(formData);
        }
        toast.success(commerce ? "Commerce mis à jour." : "Commerce créé.");
        router.push("/commerces");
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
        <Label htmlFor="name">Nom du commerce *</Label>
        <Input id="name" name="name" defaultValue={commerce?.name} required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="category">Catégorie</Label>
        <Input
          id="category"
          name="category"
          defaultValue={commerce?.category ?? ""}
          placeholder="ex. Alimentation, Maison, Services, Santé…"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={commerce?.description ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={commerce?.phone ?? ""}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={commerce?.email ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="hours">Horaires</Label>
          <Input
            id="hours"
            name="hours"
            defaultValue={commerce?.hours ?? ""}
            placeholder="ex. Lun-Sam 7h-19h"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            name="address"
            defaultValue={commerce?.address ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="notes">Notes (visible publiquement)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={commerce?.notes ?? ""}
          placeholder="ex. Congés annuels du 12 au 25 juillet, promotion du moment…"
        />
        <p className="text-xs text-gray-500">
          Affiché sur la fiche publique du commerce — à tenir à jour (congés,
          promotions, actualités).
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="image_file">Photo (optionnel)</Label>
        {commerce?.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu d'une image hébergée par civic_api, pas d'optimisation Next.js nécessaire ici.
          <img
            src={commerce.imageUrl}
            alt=""
            className="mb-2 h-24 w-auto rounded-md object-cover"
          />
        )}
        <Input
          id="image_file"
          name="image_file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        />
        <p className="text-xs text-gray-500">
          {commerce?.imageUrl
            ? "Laisser vide pour conserver l'image actuelle."
            : "JPEG, PNG ou WebP, 5 Mo maximum."}
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Sauvegarde…" : commerce ? "Enregistrer" : "Créer"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
