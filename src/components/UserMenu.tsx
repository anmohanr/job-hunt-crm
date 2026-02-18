"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
        <User size={15} />
        <span className="hidden md:inline max-w-[140px] truncate">
          {session.user.name || session.user.email}
        </span>
      </div>
      <button
        onClick={handleSignOut}
        title="Sign out"
        className="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <LogOut size={15} />
      </button>
    </div>
  );
}
