import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Header } from "@/components/Header";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  const hasKey = !!settings?.openaiApiKey;
  const maskedKey = settings?.openaiApiKey
    ? `sk-...${settings.openaiApiKey.slice(-4)}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Settings
        </h1>
        <ApiKeyForm hasKey={hasKey} maskedKey={maskedKey} />
      </main>
    </div>
  );
}
