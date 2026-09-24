import Link from "next/link";
import { PowerOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { isModuleEnabled, moduleLabel } from "@/lib/modules";
import { getCurrentStaff, getManagedCommune } from "@/lib/session";
import type { AppModule } from "@/lib/types";

export async function ModuleGate({
  module,
  children,
}: {
  module: AppModule;
  children: React.ReactNode;
}) {
  const staff = await getCurrentStaff();
  const commune = await getManagedCommune(staff);

  if (!commune || isModuleEnabled(commune.disabledModules, module)) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-md space-y-5 rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <PowerOff size={26} aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Module désactivé
        </h1>
        <p className="text-sm text-slate-500">
          Le module « {moduleLabel(module)} » est désactivé pour {commune.name}.
          {staff?.role === "SUPER_ADMIN"
            ? " Vous pouvez le réactiver depuis la gestion de la commune."
            : " Contactez City-Co pour l'activer."}
        </p>
      </div>
      {staff?.role === "SUPER_ADMIN" && (
        <Link
          href={`/superadmin/${commune.id}`}
          className={buttonVariants({ className: "h-10 px-4" })}
        >
          Gérer les modules
        </Link>
      )}
    </div>
  );
}
