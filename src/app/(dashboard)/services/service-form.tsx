"use client";

import { createService, updateService } from "@/app/actions/services";
import { uploadImage } from "@/app/actions/uploads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { Service } from "@/lib/types";

const DURATION_OPTIONS = [15, 20, 30, 60];

export function ServiceForm({ service }: { service?: Service }) {
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

        if (service) {
          await updateService(service.id, formData);
        } else {
          await createService(formData);
        }
        toast.success(service ? "Service mis à jour." : "Service créé.");
        router.push("/services");
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
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={service?.email ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="hours">Horaires</Label>
          <Input
            id="hours"
            name="hours"
            defaultValue={service?.hours ?? ""}
            placeholder="ex. Lun-Ven 9h-17h"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            name="address"
            defaultValue={service?.address ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="appointment_duration">Durée d&apos;un rendez-vous</Label>
        <select
          id="appointment_duration"
          name="appointment_duration"
          defaultValue={service?.appointmentDurationMinutes ?? 30}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {DURATION_OPTIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} minutes
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="image_file">Photo (optionnel)</Label>
        {service?.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu d'une image hébergée par civic_api, pas d'optimisation Next.js nécessaire ici.
          <img
            src={service.imageUrl}
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
          {service?.imageUrl
            ? "Laisser vide pour conserver l'image actuelle."
            : "JPEG, PNG ou WebP, 5 Mo maximum."}
        </p>
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
