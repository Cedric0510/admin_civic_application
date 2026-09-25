import { Field } from "@/components/layout/field";
import { Input } from "@/components/ui/input";

export function ImageUploadField({
  label,
  currentUrl,
  currentAlt,
}: {
  label: string;
  currentUrl?: string | null;
  currentAlt: string;
}) {
  return (
    <div className="space-y-2">
      <Field
        label={label}
        id="image_file"
        hint={
          currentUrl
            ? "Laisser vide pour conserver l'image actuelle."
            : "JPEG, PNG ou WebP, 5 Mo maximum."
        }
      >
        <Input
          name="image_file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        />
      </Field>
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- aperçu d'une image hébergée par civic_api, pas d'optimisation Next.js nécessaire ici.
        <img
          src={currentUrl}
          alt={currentAlt}
          className="h-28 w-auto rounded-xl border border-border object-cover"
        />
      )}
    </div>
  );
}
