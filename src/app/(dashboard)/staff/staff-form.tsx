"use client";

import { createStaff } from "@/app/actions/staff";
import { Field } from "@/components/layout/field";
import { FormActions } from "@/components/layout/form-actions";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
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
    <form action={handleSubmit} className="space-y-5">
      <Field
        label="Nom *"
        id="name"
        hint="Affiché dans les menus à la place de l'adresse e-mail."
      >
        <Input
          name="name"
          placeholder="ex. Marie Durand"
          minLength={2}
          maxLength={100}
          required
        />
      </Field>

      <Field label="Email *" id="email">
        <Input name="email" type="email" required />
      </Field>

      <Field label="Mot de passe *" id="password" hint="8 caractères minimum.">
        <Input name="password" type="password" minLength={8} required />
      </Field>

      <Field
        label="Rôle *"
        id="role"
        hint="Un administrateur peut à son tour gérer les agents et les paramètres de la commune."
      >
        <NativeSelect name="role" required defaultValue="AGENT">
          <option value="AGENT">Agent</option>
          <option value="ADMINISTRATEUR">Administrateur</option>
        </NativeSelect>
      </Field>

      <FormActions
        pending={pending}
        submitLabel="Créer"
        pendingLabel="Création…"
        onCancel={() => router.back()}
      />
    </form>
  );
}
