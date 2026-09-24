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
    <div className="min-h-screen md:flex">
      <Sidebar staff={staff} managedCommune={managedCommune} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
