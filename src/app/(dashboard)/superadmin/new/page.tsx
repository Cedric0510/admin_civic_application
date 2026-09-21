import { CommuneProvisionForm } from "../commune-provision-form";

export default function NewCommunePage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Nouvelle commune</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CommuneProvisionForm />
      </div>
    </div>
  );
}
