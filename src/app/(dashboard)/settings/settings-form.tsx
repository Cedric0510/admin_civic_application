"use client";

import { updateSettings, type SettingsChanges } from "@/app/actions/settings";
import { Field } from "@/components/layout/field";
import { Panel } from "@/components/layout/panel";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { CitySettings } from "@/lib/types";

const LEGAL_HINT =
  "Utilisez « ## » devant un titre et laissez une ligne vide entre deux paragraphes. « - » en début de ligne crée une liste.";

export function SettingsForm({ settings }: { settings: CitySettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(settings.village_name);
  const [postalCode, setPostalCode] = useState(settings.postal_code);
  const [legalNotice, setLegalNotice] = useState(settings.legal.legalNotice);
  const [privacyPolicy, setPrivacyPolicy] = useState(
    settings.legal.privacyPolicy,
  );

  const changes: SettingsChanges = {
    ...(name.trim() !== settings.village_name ? { name: name.trim() } : {}),
    ...(postalCode.trim() !== settings.postal_code
      ? { postalCode: postalCode.trim() }
      : {}),
    ...(legalNotice !== settings.legal.legalNotice ? { legalNotice } : {}),
    ...(privacyPolicy !== settings.legal.privacyPolicy ? { privacyPolicy } : {}),
  };
  const hasChanges = Object.keys(changes).length > 0;

  function save(payload: SettingsChanges, success: string) {
    startTransition(async () => {
      try {
        await updateSettings(payload);
        toast.success(success);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erreur lors de la sauvegarde.",
        );
      }
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (hasChanges) save(changes, "Paramètres sauvegardés.");
      }}
      className="space-y-6"
    >
      <Panel title="Identité de la commune">
        <Field
          label="Nom de la commune"
          id="village_name"
          hint="Affiché sur l'accueil de l'application."
        >
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
        <Field
          label="Code postal"
          id="postal_code"
          hint="Sert à trouver la météo de votre commune : plusieurs communes portent le même nom."
        >
          <Input
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
            inputMode="numeric"
            autoComplete="postal-code"
            pattern="\d{5}"
            title="5 chiffres"
            maxLength={5}
          />
        </Field>
      </Panel>

      <Panel
        title="Mentions légales"
        description={LEGAL_HINT}
        actions={
          <StatusBadge tone={settings.legal.legalNoticeIsCustom ? "brand" : "neutral"}>
            {settings.legal.legalNoticeIsCustom ? "Personnalisées" : "Texte modèle"}
          </StatusBadge>
        }
      >
        <div className="space-y-3">
          <Field label="Texte des mentions légales" id="legal_notice">
            <Textarea
              rows={12}
              value={legalNotice}
              onChange={(event) => setLegalNotice(event.target.value)}
            />
          </Field>
          {settings.legal.legalNoticeIsCustom && (
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() =>
                save({ legalNotice: "" }, "Texte modèle rétabli.")
              }
            >
              Rétablir le texte modèle
            </Button>
          )}
        </div>
      </Panel>

      <Panel
        title="Politique de confidentialité"
        description={LEGAL_HINT}
        actions={
          <StatusBadge tone={settings.legal.privacyPolicyIsCustom ? "brand" : "neutral"}>
            {settings.legal.privacyPolicyIsCustom ? "Personnalisée" : "Texte modèle"}
          </StatusBadge>
        }
      >
        <div className="space-y-3">
          <Field label="Texte de la politique de confidentialité" id="privacy_policy">
            <Textarea
              rows={14}
              value={privacyPolicy}
              onChange={(event) => setPrivacyPolicy(event.target.value)}
            />
          </Field>
          {settings.legal.privacyPolicyIsCustom && (
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() =>
                save({ privacyPolicy: "" }, "Texte modèle rétabli.")
              }
            >
              Rétablir le texte modèle
            </Button>
          )}
        </div>
      </Panel>

      <p className="text-sm text-muted-foreground">
        Les textes modèles nomment votre commune comme responsable du
        traitement. Faites-les relire avant la mise en service, puis
        complétez-les si besoin (adresse de la mairie, directeur de la
        publication, contact pour exercer ses droits).
      </p>

      <Button type="submit" size="lg" disabled={pending || !hasChanges}>
        {pending ? "Sauvegarde…" : "Enregistrer"}
      </Button>
    </form>
  );
}
