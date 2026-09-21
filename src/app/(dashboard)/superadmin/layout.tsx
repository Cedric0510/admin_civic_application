import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/session";

// (dashboard)/layout.tsx only checks that *some* staff account is logged
// in; provisioning communes/staff is strictly SUPER_ADMIN (same rule as
// civic_api's PROVISIONING_ROLES) -- redirect anyone else back to the
// regular dashboard rather than letting them see an empty/erroring page.
export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await getCurrentStaff();
  if (staff?.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
