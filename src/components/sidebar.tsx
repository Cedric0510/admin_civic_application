"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  BarChart3,
  Wrench,
  Settings,
  LogOut,
  Building2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth";
import type { CurrentStaff } from "@/lib/session";

const baseNavItems = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/articles", label: "Actualités", icon: Newspaper },
  { href: "/appointments", label: "Rendez-vous", icon: CalendarDays },
  { href: "/polls", label: "Sondages", icon: BarChart3 },
  { href: "/services", label: "Services", icon: Wrench },
];

const staffNavItem = { href: "/staff", label: "Agents", icon: Users };
const settingsNavItem = { href: "/settings", label: "Paramètres", icon: Settings };

const superAdminNavItem = {
  href: "/superadmin",
  label: "Communes",
  icon: Building2,
};

export function Sidebar({ staff }: { staff: CurrentStaff }) {
  const pathname = usePathname();
  // Agents/Paramètres : réservés ADMINISTRATEUR/SUPER_ADMIN côté API
  // (SETTINGS_ROLES) -- un simple AGENT ne doit pas les voir dans le menu.
  const items = [
    ...baseNavItems,
    ...(staff.role !== "AGENT" ? [staffNavItem, settingsNavItem] : []),
    ...(staff.role === "SUPER_ADMIN" ? [superAdminNavItem] : []),
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-gray-800">
        <span className="text-xl font-bold tracking-tight">City-Co</span>
        <p className="text-xs text-gray-400 mt-0.5">
          {staff.commune ? staff.commune.name : "Super administrateur"}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors w-full"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
