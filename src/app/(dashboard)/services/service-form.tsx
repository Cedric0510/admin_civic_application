"use client";

import { createService, updateService } from "@/app/actions/services";
import { uploadImage } from "@/app/actions/uploads";
import { Field } from "@/components/layout/field";
import { FormActions } from "@/components/layout/form-actions";
import { ImageUploadField } from "@/components/layout/image-upload-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
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
    <form action={handleSubmit} className="space-y-5">
      <Field label="Nom du service *" id="name">
        <Input name="name" defaultValue={service?.name} required />
      </Field>

      <Field label="Catégorie" id="category">
        <Input
          name="category"
          defaultValue={service?.category ?? ""}
          placeholder="ex. Administration, Technique, Culture…"
        />
      </Field>

      <Field label="Description" id="description">
        <Textarea
          name="description"
          rows={3}
          defaultValue={service?.description ?? ""}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Téléphone" id="phone">
          <Input name="phone" type="tel" defaultValue={service?.phone ?? ""} />
        </Field>
        <Field label="Email" id="email">
          <Input name="email" type="email" defaultValue={service?.email ?? ""} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Horaires" id="hours">
          <Input
            name="hours"
            defaultValue={service?.hours ?? ""}
            placeholder="ex. Lun-Ven 9h-17h"
          />
        </Field>
        <Field label="Adresse" id="address">
          <Input name="address" defaultValue={service?.address ?? ""} />
        </Field>
      </div>

      <Field label="Durée d'un rendez-vous" id="appointment_duration">
        <NativeSelect
          name="appointment_duration"
          defaultValue={service?.appointmentDurationMinutes ?? 30}
        >
          {DURATION_OPTIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} minutes
            </option>
          ))}
        </NativeSelect>
      </Field>

      <ImageUploadField
        label="Photo (facultative)"
        currentUrl={service?.imageUrl}
        currentAlt="Photo actuelle du service"
      />

      <FormActions
        pending={pending}
        submitLabel={service ? "Enregistrer" : "Créer"}
        pendingLabel="Sauvegarde…"
        onCancel={() => history.back()}
      />
    </form>
  );
}
