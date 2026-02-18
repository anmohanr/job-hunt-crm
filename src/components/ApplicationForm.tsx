"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Application } from "@prisma/client";
import { PIPELINE_STAGES, PRIORITIES } from "@/lib/types";
import {
  createApplication,
  updateApplication,
  deleteApplication,
} from "@/lib/actions/applications";

interface ApplicationFormProps {
  application?: Application | null;
}

export function ApplicationForm({ application }: ApplicationFormProps) {
  const router = useRouter();
  const isEditing = !!application;

  const [formData, setFormData] = useState({
    company: application?.company || "",
    roleTitle: application?.roleTitle || "",
    location: application?.location || "",
    jobUrl: application?.jobUrl || "",
    stage: application?.stage || "Interested",
    priority: application?.priority || "Med",
    appliedDate: application?.appliedDate
      ? new Date(application.appliedDate).toISOString().split("T")[0]
      : "",
    nextFollowUpDate: application?.nextFollowUpDate
      ? new Date(application.nextFollowUpDate).toISOString().split("T")[0]
      : "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    }
    if (!formData.roleTitle.trim()) {
      newErrors.roleTitle = "Role title is required";
    }
    if (formData.jobUrl && !isValidUrl(formData.jobUrl)) {
      newErrors.jobUrl = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data = {
        company: formData.company,
        roleTitle: formData.roleTitle,
        location: formData.location || undefined,
        jobUrl: formData.jobUrl || undefined,
        stage: formData.stage,
        priority: formData.priority,
        appliedDate: formData.appliedDate
          ? new Date(formData.appliedDate)
          : undefined,
        nextFollowUpDate: formData.nextFollowUpDate
          ? new Date(formData.nextFollowUpDate)
          : undefined,
      };

      if (isEditing) {
        await updateApplication(application.id, {
          ...data,
          location: data.location || null,
          jobUrl: data.jobUrl || null,
          appliedDate: data.appliedDate || null,
          nextFollowUpDate: data.nextFollowUpDate || null,
        });
        router.push(`/applications/${application.id}`);
      } else {
        const newApp = await createApplication(data);
        router.push(`/applications/${newApp.id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!application) return;
    setIsSubmitting(true);
    await deleteApplication(application.id);
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Company <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.company ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="e.g., Google"
          />
          {errors.company && (
            <p className="text-red-500 text-sm mt-1">{errors.company}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.roleTitle}
            onChange={(e) =>
              setFormData({ ...formData, roleTitle: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.roleTitle ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="e.g., Software Engineer"
          />
          {errors.roleTitle && (
            <p className="text-red-500 text-sm mt-1">{errors.roleTitle}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="e.g., NYC, Remote"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Job URL
          </label>
          <input
            type="text"
            value={formData.jobUrl}
            onChange={(e) =>
              setFormData({ ...formData, jobUrl: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.jobUrl ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="https://..."
          />
          {errors.jobUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.jobUrl}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stage
          </label>
          <select
            value={formData.stage}
            onChange={(e) =>
              setFormData({ ...formData, stage: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {PIPELINE_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Applied Date
          </label>
          <input
            type="date"
            value={formData.appliedDate}
            onChange={(e) =>
              setFormData({ ...formData, appliedDate: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Next Follow-up Date
          </label>
          <input
            type="date"
            value={formData.nextFollowUpDate}
            onChange={(e) =>
              setFormData({ ...formData, nextFollowUpDate: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
            ? "Update Application"
            : "Create Application"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        {isEditing && (
          <>
            {showDeleteConfirm ? (
              <div className="flex gap-2 ml-auto">
                <span className="text-sm text-gray-600 dark:text-gray-400 self-center">
                  Are you sure?
                </span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </form>
  );
}
