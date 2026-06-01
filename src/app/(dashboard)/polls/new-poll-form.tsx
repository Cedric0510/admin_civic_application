"use client";

import { createPoll } from "@/app/actions/polls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <div className="space-y-1">
        <Label htmlFor="question">Question</Label>
        <Input id="question" name="question" required />
      </div>

      <div className="space-y-2">
        <Label>Options de réponse</Label>
        {options.map((option, i) => (
          <div key={i} className="flex gap-2">
            <Input
              name="option"
              value={option}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              required
            />
            {options.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOption(i)}
              >
                <Trash2 size={16} className="text-red-500" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          className="mt-1"
        >
          <Plus size={14} />
          Ajouter une option
        </Button>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer le sondage"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
