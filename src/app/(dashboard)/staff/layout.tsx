import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/session";

// GET/POST /staff is SETTINGS_ROLES (ADMINISTRATEUR/SUPER_ADMIN) on
// civic_api -- an AGENT hitting this page would otherwise get a raw
// ApiError instead of a clean redirect, same reasoning as
// superadmin/layout.tsx.
export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await getCurrentStaff();
  if (staff?.role === "AGENT") {
    redirect("/");
  }

  return <>{children}</>;
}
