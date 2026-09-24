import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogIn, Plus, Settings2 } from "lucide-react";
import { getCommunes, manageCommune } from "@/app/actions/superadmin";

export default async function SuperAdminPage() {
  const communes = await getCommunes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Provisionnement des communes partenaires et de leur premier
            compte administrateur.
          </p>
        </div>
        <Link href="/superadmin/new" className={buttonVariants()}>
          <Plus size={16} />
          Nouvelle commune
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {communes.length === 0 ? (
          <p className="text-center text-gray-500 py-12 text-sm">
            Aucune commune provisionnée.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Identifiant (slug)</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Accès</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead className="w-64 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communes.map((commune) => (
                <TableRow key={commune.id}>
                  <TableCell className="font-medium">{commune.name}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {commune.slug}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(commune.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={commune.suspendedAt ? "destructive" : "secondary"}
                    >
                      {commune.suspendedAt ? "Suspendu" : "Actif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {commune.disabledModules.length === 0
                      ? "Tous actifs"
                      : `${commune.disabledModules.length} désactivé${commune.disabledModules.length > 1 ? "s" : ""}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/superadmin/${commune.id}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        <Settings2 size={14} />
                        Accès et modules
                      </Link>
                      <form action={manageCommune}>
                        <input type="hidden" name="slug" value={commune.slug} />
                        <Button type="submit" variant="outline" size="sm">
                          <LogIn size={14} />
                          Gérer
                        </Button>
                      </form>
                    </div>
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
