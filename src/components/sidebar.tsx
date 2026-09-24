"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  CalendarClock,
  BarChart3,
  Wrench,
  Store,
  AlertTriangle,
  Settings,
  LogOut,
  Building2,
  Users,
  Landmark,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth";
import { stopManagingCommune } from "@/app/actions/superadmin";
import { isModuleEnabled } from "@/lib/modules";
import type { CurrentStaff, ManagedCommune } from "@/lib/session";
import type { AppModule } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  module?: AppModule;
};
type NavGroup = { label: string; items: NavItem[] };

const roleLabels: Record<CurrentStaff["role"], string> = {
  AGENT: "Agent",
  ADMINISTRATEUR: "Administrateur",
  SUPER_ADMIN: "Super administrateur",
};

function navGroups(
  role: CurrentStaff["role"],
  disabledModules: AppModule[],
): NavGroup[] {
  const administration: NavItem[] = [
    ...(role !== "AGENT"
      ? [
          { href: "/staff", label: "Agents", icon: Users },
          { href: "/settings", label: "Paramètres", icon: Settings },
        ]
      : []),
    ...(role === "SUPER_ADMIN"
      ? [{ href: "/superadmin", label: "Communes", icon: Building2 }]
      : []),
  ];

  const groups: NavGroup[] = [
    {
      label: "Pilotage",
      items: [{ href: "/", label: "Tableau de bord", icon: LayoutDashboard }],
    },
    {
      label: "Contenus",
      items: [
        {
          href: "/articles",
          label: "Actualités",
          icon: Newspaper,
          module: "ARTICLES",
        },
        { href: "/polls", label: "Sondages", icon: BarChart3, module: "POLLS" },
        {
          href: "/services",
          label: "Services",
          icon: Wrench,
          module: "SERVICES",
        },
        {
          href: "/commerces",
          label: "Commerçants",
          icon: Store,
          module: "COMMERCES",
        },
      ],
    },
    {
      label: "Habitants",
      items: [
        {
          href: "/appointments",
          label: "Rendez-vous",
          icon: CalendarDays,
          module: "APPOINTMENTS",
        },
        {
          href: "/agenda",
          label: "Agenda",
          icon: CalendarClock,
          module: "APPOINTMENTS",
        },
        {
          href: "/reports",
          label: "Signalements",
          icon: AlertTriangle,
          module: "REPORTS",
        },
      ],
    },
    { label: "Administration", items: administration },
  ];

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.module || isModuleEnabled(disabledModules, item.module),
      ),
    }))
    .filter((group) => group.items.length > 0);
}

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function SidebarContent({
  staff,
  managedCommune,
  onNavigate,
}: {
  staff: CurrentStaff;
  managedCommune: ManagedCommune | null;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const isManagingAsSuperAdmin =
    staff.role === "SUPER_ADMIN" && managedCommune !== null;
  const disabledModules =
    managedCommune?.disabledModules ?? staff.commune?.disabledModules ?? [];

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="space-y-3 px-5 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-950/40">
            <Landmark size={20} aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-semibold tracking-tight">City-Co</p>
            <p className="text-xs text-brand-200/80">Espace mairie</p>
          </div>
        </div>

        {isManagingAsSuperAdmin ? (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-amber-300">
              Gestion à distance
            </p>
            <p className="text-sm font-semibold text-amber-100">
              {managedCommune.name}
            </p>
            <form action={stopManagingCommune}>
              <button
                type="submit"
                className="mt-1 text-xs text-amber-300 underline underline-offset-2 hover:text-amber-200"
              >
                Quitter
              </button>
            </form>
          </div>
        ) : (
          <p className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-brand-100">
            <MapPin size={14} aria-hidden="true" className="shrink-0 text-brand-300" />
            <span className="truncate">
              {staff.commune ? staff.commune.name : "Toutes les communes"}
            </span>
          </p>
        )}
      </div>

      <nav aria-label="Navigation principale" className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {navGroups(staff.role, disabledModules).map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-300/70">
              {group.label}
            </p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-white/12 text-white"
                      : "text-brand-100/80 hover:bg-white/8 hover:text-white",
                  )}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-300"
                    />
                  )}
                  <Icon size={18} aria-hidden="true" className={active ? "text-brand-200" : ""} />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-500 text-sm font-semibold text-white"
          >
            {initials(staff.name)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-white">{staff.name}</p>
            <p className="truncate text-xs text-brand-200/80">
              {roleLabels[staff.role]}
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Se déconnecter"
              title="Se déconnecter"
              className="grid size-9 place-items-center rounded-lg text-brand-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({
  staff,
  managedCommune,
}: {
  staff: CurrentStaff;
  managedCommune: ManagedCommune | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-sidebar px-4 text-sidebar-foreground md:hidden">
        <span className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600">
            <Landmark size={16} aria-hidden="true" />
          </span>
          City-Co
        </span>
        <button
          type="button"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="grid size-10 place-items-center rounded-lg hover:bg-white/10"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/60"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            <SidebarContent
              staff={staff}
              managedCommune={managedCommune}
              onNavigate={() => setOpen(false)}
            />
            <button
              type="button"
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 grid size-9 place-items-center rounded-lg text-brand-200 hover:bg-white/10"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <aside className="hidden w-64 shrink-0 md:sticky md:top-0 md:block md:h-screen">
        <SidebarContent
          staff={staff}
          managedCommune={managedCommune}
          onNavigate={() => undefined}
        />
      </aside>
    </>
  );
}
