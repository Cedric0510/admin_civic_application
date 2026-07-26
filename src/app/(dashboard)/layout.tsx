import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { getCurrentStaff } from "@/lib/session";

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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
