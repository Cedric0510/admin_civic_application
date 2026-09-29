import Link from "next/link";
import { Building2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "./empty-state";

export function ManagedCommuneNotice() {
  return (
    <EmptyState
      icon={Building2}
      title="Choisissez une commune"
      description="Cette page dépend d'une commune précise : sélectionnez-en une à gérer avant de continuer."
      action={
        <Link href="/superadmin" className={buttonVariants()}>
          Voir les communes
        </Link>
      }
    />
  );
}
