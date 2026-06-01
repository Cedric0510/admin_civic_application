import { NewPollForm } from "../new-poll-form";

export default function NewPollPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Nouveau sondage</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <NewPollForm />
      </div>
    </div>
  );
}
