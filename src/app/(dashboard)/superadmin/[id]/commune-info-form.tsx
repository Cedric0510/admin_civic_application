"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateCommuneInfo } from "@/app/actions/superadmin";
import { Field } from "@/components/layout/field";
import { Panel } from "@/components/layout/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CommuneInfoForm({
  communeId,
  name,
  postalCode,
  slug,
}: {
  communeId: string;
  name: string;
  postalCode: string | null;
  slug: string;
}) {
  const [pending, startTransition] = useTransition();
  const [nameValue, setNameValue] = useState(name);
  const [postalCodeValue, setPostalCodeValue] = useState(postalCode ?? "");
  const [slugValue, setSlugValue] = useState(slug);

  const changes = {
    ...(nameValue.trim() !== name ? { name: nameValue.trim() } : {}),
    ...(postalCodeValue.trim() !== (postalCode ?? "")
      ? { postalCode: postalCodeValue.trim() }
      : {}),
    ...(slugValue.trim() !== slug ? { slug: slugValue.trim() } : {}),
  };
  const hasChanges = Object.keys(changes).length > 0;

  function save() {
    startTransition(async () => {
      try {
        await updateCommuneInfo(communeId, changes);
        toast.success("Informations mises à jour.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  return (
    <Panel title="Informations générales">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (hasChanges) save();
        }}
        className="space-y-5"
      >
        <Field label="Nom" id="commune-name">
          <Input
            value={nameValue}
            onChange={(event) => setNameValue(event.target.value)}
            required
          />
        </Field>
        <Field
          label="Code postal"
          id="commune-postal-code"
          hint="Sert à trouver la météo de la commune : plusieurs communes portent le même nom."
        >
          <Input
            value={postalCodeValue}
            onChange={(event) => setPostalCodeValue(event.target.value)}
            inputMode="numeric"
            pattern="\d{5}"
            title="5 chiffres"
            maxLength={5}
          />
        </Field>
        <Field
          label="Identifiant (slug)"
          id="commune-slug"
          hint="Identifiant technique utilisé dans les liens de l'application -- sans lien avec la météo, qui utilise le code postal ci-dessus. À corriger seulement en cas d'erreur : les liens déjà envoyés aux habitants changent avec lui."
        >
          <Input
            value={slugValue}
            onChange={(event) => setSlugValue(event.target.value)}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Minuscules, chiffres et tirets uniquement (ex. ma-commune)."
            required
          />
        </Field>
        <Button type="submit" disabled={pending || !hasChanges}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </Panel>
  );
}
