"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Дашборд", icon: "⊞" },
  { href: "/team", label: "Моя команда", icon: "👥" },
  { href: "/billing", label: "Биллинг", icon: "💳" },
  { href: "/audit", label: "Аудит", icon: "📋" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-56 lg:w-64 flex-col border-r border-border-light bg-white py-4 shrink-0">
      <nav className="flex flex-col gap-1 px-3" aria-label="Основная навигация">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded px-3 py-2 text-body-md transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="text-lg" aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pt-4 border-t border-border-light mx-3">
        <Link
          href="/pricing"
          className="flex items-center gap-2 rounded px-3 py-2 text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          💎 Тарифы
        </Link>
      </div>
    </aside>
  );
}
