import Link from "next/link";
import { Building2, LogIn, Plus, Settings2 } from "lucide-react";
import { getCommunes, manageCommune } from "@/app/actions/superadmin";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { StatusBadge } from "@/components/layout/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function SuperAdminPage() {
  const communes = await getCommunes();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communes"
        description="Provisionnement des communes partenaires et de leur premier compte administrateur."
        actions={
          <Link href="/superadmin/new" className={buttonVariants({ size: "lg" })}>
            <Plus size={16} aria-hidden="true" />
            Nouvelle commune
          </Link>
        }
      />

      <Panel padded={false}>
        {communes.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Aucune commune provisionnée"
            description="Créez la première commune partenaire avec son compte administrateur."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Identifiant (slug)</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Accès</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead className="w-72 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communes.map((commune) => (
                <TableRow key={commune.id}>
                  <TableCell className="font-medium">{commune.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {commune.slug}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(commune.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={commune.suspendedAt ? "bad" : "good"}>
                      {commune.suspendedAt ? "Suspendu" : "Actif"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
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
                        <Settings2 size={14} aria-hidden="true" />
                        Accès et modules
                      </Link>
                      <form action={manageCommune}>
                        <input type="hidden" name="slug" value={commune.slug} />
                        <Button type="submit" variant="outline" size="sm">
                          <LogIn size={14} aria-hidden="true" />
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
      </Panel>
    </div>
  );
}
