import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/session";

export default async function FeedbackLayout({
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
