import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { NavLinks } from "./NavLinks";
import { UserMenu } from "./UserMenu";

export function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
            <Briefcase size={20} className="text-blue-600" />
            Job Hunt CRM
          </Link>
          <nav className="flex items-center gap-1">
            <NavLinks />
            <ThemeToggle />
            <UserMenu />
            <Link
              href="/applications/new"
              className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm ml-2"
            >
              <Plus size={15} />
              Add Application
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
