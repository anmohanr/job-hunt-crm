import { Header } from "@/components/Header";
import { ApplicationsTable } from "@/components/ApplicationsTable";
import { getApplications } from "@/lib/actions/applications";

export default async function ApplicationsListPage() {
  const applications = await getApplications();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Applications List
        </h1>
        <ApplicationsTable applications={applications} />
      </main>
    </div>
  );
}
