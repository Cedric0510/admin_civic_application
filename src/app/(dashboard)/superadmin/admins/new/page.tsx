import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { SuperAdminForm } from "../../super-admin-form";

export default function NewSuperAdminPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Nouveau super-administrateur"
        backHref="/superadmin/admins"
        backLabel="Super-administrateurs"
      />
      <Panel>
        <SuperAdminForm />
      </Panel>
    </div>
  );
}
