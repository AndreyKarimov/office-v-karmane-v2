import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const plans = [
  {
    name: "Free",
    price: "0 ₽",
    period: "мес",
    features: ["До 10 задач", "1 ИИ-сотрудник", "50 AI-запросов/мес", "Канбан-доска", "Чат с ИИ-менеджером"],
    cta: "Текущий",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "2 990 ₽",
    period: "мес",
    features: ["До 100 задач", "5 ИИ-сотрудников", "500 AI-запросов/мес", "Полный цикл задач", "Приоритетная поддержка", "Экспорт отчётов"],
    cta: "Перейти на Pro",
    highlighted: true,
  },
  {
    name: "Business",
    price: "9 990 ₽",
    period: "мес",
    features: ["Безлимит задач", "20 ИИ-сотрудников", "5 000 AI-запросов/мес", "RBAC и аудит", "Приглашение коллег", "Интеграции (Jira, Notion)", "2FA", "SLA 99.5%"],
    cta: "Связаться с нами",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between px-4 md:px-8 h-16 border-b border-border-light bg-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-primary text-on-primary font-bold">
            ОК
          </div>
          <span className="font-semibold text-on-surface text-body-lg">Офис в кармане</span>
        </Link>
        <Link href="/login"><Button variant="ghost" size="sm">Войти</Button></Link>
      </header>

      <main className="flex-1 py-12 px-4">
        <div className="text-center mb-10">
          <h1 className="text-headline-lg">Тарифы</h1>
          <p className="text-body-lg text-on-surface-variant mt-2 max-w-md mx-auto">
            Выберите план под ваши задачи. Бесплатный тариф не требует карты.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`flex flex-col p-6 ${plan.highlighted ? "ring-2 ring-primary relative" : ""}`}>
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-label-sm text-on-primary">
                  Популярный
                </div>
              )}
              <h2 className="text-headline-md mb-1">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-headline-lg">{plan.price}</span>
                <span className="text-body-md text-on-surface-variant">/{plan.period}</span>
              </div>
              <ul className="flex flex-col gap-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                    <span className="text-primary mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.highlighted ? "primary" : "ghost"} className="w-full">
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
