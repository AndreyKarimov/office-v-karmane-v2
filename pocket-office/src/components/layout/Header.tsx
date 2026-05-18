"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { logoutAction } from "@/lib/auth-actions";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border-light bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2" aria-label="Офис в кармане — главная">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-on-primary font-bold text-sm">
              ОК
            </div>
            <span className="hidden font-semibold text-on-surface sm:inline text-body-lg">
              Офис в кармане
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-2" aria-label="Действия">
          <Button variant="ghost" size="sm">Помощь</Button>
          {session?.user && (
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" type="submit">Выйти</Button>
            </form>
          )}
          <Avatar
            src={session?.user?.image || undefined}
            name={session?.user?.name || "?"}
            size="sm"
          />
        </nav>
      </div>
    </header>
  );
}
