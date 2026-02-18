"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trello, List, MessageSquare, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard",    label: "Dashboard", icon: LayoutDashboard },
  { href: "/",             label: "Board",     icon: Trello },
  { href: "/applications", label: "List",      icon: List },
  { href: "/chat",         label: "Chat",      icon: MessageSquare },
  { href: "/settings",     label: "Settings",  icon: Settings },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              active
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            <Icon size={15} />
            {label}
          </Link>
        );
      })}
    </>
  );
}
