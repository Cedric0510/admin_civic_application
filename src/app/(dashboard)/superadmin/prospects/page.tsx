import { getCommuneProspects } from "@/app/actions/superadmin";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCompactDateTime } from "@/lib/paris-time";
import { Target } from "lucide-react";

export default async function CommuneProspectsPage() {
  const prospects = await getCommuneProspects();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospection"
        description="Codes postaux recherchés à l'inscription ou au changement de commune, sans commune partenaire correspondante : des habitants d'une ville pas encore cliente."
        backHref="/superadmin"
        backLabel="Communes"
      />

      <Panel padded={false}>
        {prospects.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Aucune recherche en attente"
            description="Les codes postaux qui ne correspondent à aucune commune partenaire apparaîtront ici."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code postal</TableHead>
                <TableHead>Recherches</TableHead>
                <TableHead>Première fois</TableHead>
                <TableHead>Dernière fois</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prospects.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell label="Code postal" className="font-medium">
                    {prospect.postalCode}
                  </TableCell>
                  <TableCell
                    label="Recherches"
                    className="text-muted-foreground"
                  >
                    {prospect.searchCount}
                  </TableCell>
                  <TableCell
                    label="Première fois"
                    className="whitespace-nowrap text-sm text-muted-foreground"
                  >
                    {formatCompactDateTime(prospect.firstSearchedAt)}
                  </TableCell>
                  <TableCell
                    label="Dernière fois"
                    className="whitespace-nowrap text-sm text-muted-foreground"
                  >
                    {formatCompactDateTime(prospect.lastSearchedAt)}
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
