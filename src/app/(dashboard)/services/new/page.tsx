import { ServiceForm } from "../service-form";

export default function NewServicePage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Nouveau service</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ServiceForm />
      </div>
    </div>
  );
}
