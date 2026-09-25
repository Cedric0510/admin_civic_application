"use client";

import { createCommerce, updateCommerce } from "@/app/actions/commerces";
import { uploadImage } from "@/app/actions/uploads";
import { Field } from "@/components/layout/field";
import { FormActions } from "@/components/layout/form-actions";
import { ImageUploadField } from "@/components/layout/image-upload-field";
import { Input } from "@/components/ui/input";
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
    <form action={handleSubmit} className="space-y-5">
      <Field label="Nom du commerce *" id="name">
        <Input name="name" defaultValue={commerce?.name} required />
      </Field>

      <Field label="Catégorie" id="category">
        <Input
          name="category"
          defaultValue={commerce?.category ?? ""}
          placeholder="ex. Alimentation, Maison, Services, Santé…"
        />
      </Field>

      <Field label="Description" id="description">
        <Textarea
          name="description"
          rows={3}
          defaultValue={commerce?.description ?? ""}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Téléphone" id="phone">
          <Input name="phone" type="tel" defaultValue={commerce?.phone ?? ""} />
        </Field>
        <Field label="Email" id="email">
          <Input name="email" type="email" defaultValue={commerce?.email ?? ""} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Horaires" id="hours">
          <Input
            name="hours"
            defaultValue={commerce?.hours ?? ""}
            placeholder="ex. Lun-Sam 7h-19h"
          />
        </Field>
        <Field label="Adresse" id="address">
          <Input name="address" defaultValue={commerce?.address ?? ""} />
        </Field>
      </div>

      <Field
        label="Notes (visibles publiquement)"
        id="notes"
        hint="Affichées sur la fiche publique du commerce : congés, promotions, actualités. À tenir à jour."
      >
        <Textarea
          name="notes"
          rows={2}
          defaultValue={commerce?.notes ?? ""}
          placeholder="ex. Congés annuels du 12 au 25 juillet, promotion du moment…"
        />
      </Field>

      <ImageUploadField
        label="Photo (facultative)"
        currentUrl={commerce?.imageUrl}
        currentAlt="Photo actuelle du commerce"
      />

      <FormActions
        pending={pending}
        submitLabel={commerce ? "Enregistrer" : "Créer"}
        pendingLabel="Sauvegarde…"
        onCancel={() => history.back()}
      />
    </form>
  );
}
