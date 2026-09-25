import { ImageIcon } from "lucide-react";

export function PhotoThumbnail({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted text-muted-foreground outline-none transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ImageIcon size={22} aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element -- miniature d'une image hébergée par civic_api ; l'icône dessous reste visible si l'image ne charge pas. */}
      <img
        src={url}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
      />
    </a>
  );
}
