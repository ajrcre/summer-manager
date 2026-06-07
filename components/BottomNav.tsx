"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CalendarRange,
  Gift,
  Home,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";

const items = [
  { href: "/", label: "בית", icon: Home },
  { href: "/today", label: "היום", icon: Sparkles },
  { href: "/goals", label: "מטרות", icon: Target },
  { href: "/week", label: "שבוע", icon: CalendarRange },
  { href: "/month", label: "חודש", icon: CalendarDays },
  { href: "/rewards", label: "פרסים", icon: Gift },
  { href: "/activities", label: "ניהול", icon: ListChecks },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-violet-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-stretch justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                active ? "text-brand" : "text-slate-400"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.6 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
