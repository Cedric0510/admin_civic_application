import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { getStaff } from "@/app/actions/staff";

const roleLabels = {
  AGENT: "Agent",
  ADMINISTRATEUR: "Administrateur",
  SUPER_ADMIN: "Super administrateur",
};

export default async function StaffPage() {
  const staff = await getStaff();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Comptes ayant accès à ce dashboard pour votre commune.
          </p>
        </div>
        <Link href="/staff/new" className={buttonVariants()}>
          <Plus size={16} />
          Nouvel agent
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {staff.length === 0 ? (
          <p className="text-center text-gray-500 py-12 text-sm">
            Aucun agent.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Depuis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{roleLabels[member.role]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(member.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
