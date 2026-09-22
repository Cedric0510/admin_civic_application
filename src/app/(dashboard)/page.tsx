import Link from "next/link";
import { Newspaper, CalendarDays, BarChart3, Users, Building2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { getCurrentStaff, getManagedCommune } from "@/lib/session";
import { buttonVariants } from "@/components/ui/button";

type CommuneStats = {
  articles: number;
  appointments: number;
  activePolls: number;
  citizens: number;
};

async function getStats(communeId: string): Promise<CommuneStats> {
  try {
    return await api.get<CommuneStats>(`/communes/me/stats?communeId=${communeId}`);
  } catch {
    // Réservé à ADMINISTRATEUR/SUPER_ADMIN côté civic_api : un agent
    // connecté verra un tableau de bord à zéro plutôt qu'une erreur.
    return { articles: 0, appointments: 0, activePolls: 0, citizens: 0 };
  }
}

const statCards = [
  {
    key: "articles" as const,
    label: "Actualités publiées",
    icon: Newspaper,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "appointments" as const,
    label: "Rendez-vous en attente",
    icon: CalendarDays,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    key: "activePolls" as const,
    label: "Sondages actifs",
    icon: BarChart3,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    key: "citizens" as const,
    label: "Citoyens inscrits",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export default async function DashboardPage() {
  const staff = await getCurrentStaff();
  const commune = await getManagedCommune(staff);

  if (!commune) {
    // Super-admin connecté mais n'ayant encore choisi aucune commune à
    // gérer -- pas de dashboard vide/confus, un renvoi direct vers le
    // sélecteur.
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
          <Building2 size={32} className="mx-auto text-gray-400" />
          <p className="text-gray-600">
            Vous êtes connecté en tant que super-administrateur. Choisissez
            une commune à gérer pour accéder à son tableau de bord.
          </p>
          <Link href="/superadmin" className={buttonVariants()}>
            Voir les communes
          </Link>
        </div>
      </div>
    );
  }

  const stats = await getStats(commune.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, color, bg }) => (
          <div
            key={key}
            className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
          >
            <div className={`${bg} p-3 rounded-lg`}>
              <Icon size={22} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats[key]}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
