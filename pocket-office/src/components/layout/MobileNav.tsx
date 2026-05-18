export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-14 border-t border-border-light bg-white" aria-label="Мобильная навигация">
      {[
        { href: "/dashboard", label: "Дашборд", icon: "⊞" },
        { href: "/team", label: "Команда", icon: "👥" },
        { href: "/billing", label: "Счёт", icon: "💳" },
        { href: "/audit", label: "Аудит", icon: "📋" },
      ].map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-label-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="text-base">{item.icon}</span>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
