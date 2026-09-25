"use client";

import { provisionCommune } from "@/app/actions/superadmin";
import { Field } from "@/components/layout/field";
import { FormActions } from "@/components/layout/form-actions";
import { Input } from "@/components/ui/input";
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
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <fieldset className="space-y-5">
        <legend className="mb-4 text-sm font-semibold text-foreground">
          Commune
        </legend>
        <Field label="Nom *" id="communeName">
          <Input name="communeName" placeholder="Bessan" required />
        </Field>
        <Field
          label="Identifiant (slug) *"
          id="communeSlug"
          hint="Minuscules, chiffres et tirets uniquement. Utilisé par l'application mobile pour identifier la commune."
        >
          <Input
            name="communeSlug"
            placeholder="bessan"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Minuscules, chiffres et tirets uniquement (ex. ma-commune)."
            required
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-5 border-t border-border pt-6">
        <legend className="mb-4 text-sm font-semibold text-foreground">
          Premier compte administrateur
        </legend>
        <Field label="Nom *" id="adminName">
          <Input
            name="adminName"
            placeholder="Marie Durand"
            minLength={2}
            maxLength={100}
            required
          />
        </Field>
        <Field label="Email *" id="adminEmail">
          <Input
            name="adminEmail"
            type="email"
            placeholder="mairie@bessan.fr"
            required
          />
        </Field>
        <Field label="Mot de passe *" id="adminPassword" hint="8 caractères minimum.">
          <Input name="adminPassword" type="password" minLength={8} required />
        </Field>
      </fieldset>

      <FormActions
        pending={pending}
        submitLabel="Provisionner"
        pendingLabel="Création…"
        onCancel={() => router.back()}
      />
    </form>
  );
}
