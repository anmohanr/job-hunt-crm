import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { NotesSection } from "@/components/NotesSection";
import { getApplication } from "@/lib/actions/applications";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  const isOverdue =
    application.nextFollowUpDate &&
    new Date(application.nextFollowUpDate) < new Date();

  const priorityColors = {
    High: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    Med: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    Low: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {application.company}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">{application.roleTitle}</p>
          </div>
          <Link
            href={`/applications/${application.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Stage</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{application.stage}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
              <span
                className={`inline-block px-2 py-1 rounded text-sm ${
                  priorityColors[
                    application.priority as keyof typeof priorityColors
                  ]
                }`}
              >
                {application.priority}
              </span>
            </div>
            {application.location && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{application.location}</p>
              </div>
            )}
            {application.jobUrl && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Job URL</p>
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Posting
                </a>
              </div>
            )}
            {application.appliedDate && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Applied Date</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(application.appliedDate).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Next Follow-up</p>
              {application.nextFollowUpDate ? (
                <p
                  className={`font-medium ${
                    isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {isOverdue && "OVERDUE: "}
                  {new Date(application.nextFollowUpDate).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-gray-400 dark:text-gray-500">Not set</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Created: {new Date(application.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Updated: {new Date(application.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <NotesSection
            applicationId={application.id}
            notes={application.notes}
          />
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Board
          </Link>
        </div>
      </main>
    </div>
  );
}
