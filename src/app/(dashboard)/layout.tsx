import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { getCurrentStaff, getManagedCommune } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Le proxy ne fait qu'un contrôle de présence du cookie ; ici on revalide
  // réellement le token auprès de civic_api avant de rendre quoi que ce soit.
  const staff = await getCurrentStaff();
  if (!staff) {
    redirect("/login");
  }
  // staff déjà chargé : évite un second GET /staff/me dans getManagedCommune.
  const managedCommune = await getManagedCommune(staff);

  return (
    <div className="flex min-h-screen">
      <Sidebar staff={staff} managedCommune={managedCommune} />
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
