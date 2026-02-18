import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ApplicationForm } from "@/components/ApplicationForm";
import { getApplication } from "@/lib/actions/applications";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Edit Application
        </h1>
        <ApplicationForm application={application} />
      </main>
    </div>
  );
}
