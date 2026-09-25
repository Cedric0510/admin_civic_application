"use client";

import Link from "next/link";
import { Trash2, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function IconLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={buttonVariants({ variant: "ghost", size: "icon" })}
    >
      <Icon size={16} aria-hidden="true" />
    </Link>
  );
}

export function ConfirmDeleteButton({
  label,
  title,
  description,
  pending = false,
  disabled = false,
  onConfirm,
}: {
  label: string;
  title: string;
  description: string;
  pending?: boolean;
  disabled?: boolean;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={label}
        title={label}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <Trash2 size={16} className="text-red-500" aria-hidden="true" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
          >
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
