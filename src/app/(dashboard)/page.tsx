import { createClient } from "@/lib/supabase/server";
import { Newspaper, CalendarDays, BarChart3, Users } from "lucide-react";

async function getStats() {
  const supabase = await createClient();

  const [articles, appointments, polls, profiles] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase.from("appointments").select("id", { count: "exact", head: true }),
    supabase
      .from("polls")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("user_profiles")
      .select("id", { count: "exact", head: true }),
  ]);

  return {
    articles: articles.count ?? 0,
    appointments: appointments.count ?? 0,
    activePolls: polls.count ?? 0,
    citizens: profiles.count ?? 0,
  };
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
  const stats = await getStats();

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
