"use client";

import { createPoll } from "@/app/actions/polls";
import { Field } from "@/components/layout/field";
import { FormActions } from "@/components/layout/form-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function NewPollForm() {
  const [options, setOptions] = useState(["", ""]);
  const [pending, startTransition] = useTransition();

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createPoll(formData);
        toast.success("Sondage créé avec succès.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Une erreur est survenue.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <Field label="Question" id="question">
        <Input name="question" required />
      </Field>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Options de réponse</legend>
        {options.map((option, i) => (
          <div key={i} className="flex gap-2">
            <Input
              name="option"
              value={option}
              aria-label={`Option ${i + 1}`}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              required
            />
            {options.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Supprimer l'option ${i + 1}`}
                onClick={() => removeOption(i)}
              >
                <Trash2 size={16} className="text-red-500" aria-hidden="true" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          <Plus size={14} aria-hidden="true" />
          Ajouter une option
        </Button>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ouverture (facultative)" id="opens_at">
          <Input name="opens_at" type="datetime-local" />
        </Field>
        <Field label="Clôture (facultative)" id="closes_at">
          <Input name="closes_at" type="datetime-local" />
        </Field>
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        Laissez vide pour un sondage ouvert dès sa création et sans date de fin.
      </p>

      <FormActions
        pending={pending}
        submitLabel="Créer le sondage"
        pendingLabel="Création…"
        onCancel={() => history.back()}
      />
    </form>
  );
}
