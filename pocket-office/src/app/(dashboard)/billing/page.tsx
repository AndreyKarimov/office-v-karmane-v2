import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";

export default function BillingPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-headline-lg mb-6">Биллинг</h1>

      {/* Current plan */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Chip variant="default">Free</Chip>
            <h2 className="text-headline-md mt-2">Бесплатный тариф</h2>
            <p className="text-body-md text-on-surface-variant mt-1">
              До 10 задач, 1 ИИ-сотрудник, 50 AI-запросов/мес
            </p>
          </div>
          <a href="/pricing">
            <Button>Перейти на Pro</Button>
          </a>
        </div>
      </Card>

      {/* Credits */}
      <Card className="p-5 mb-6">
        <h2 className="text-headline-md mb-4">Consumption Credits</h2>
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <p className="text-label-md text-on-surface-variant">Доступно</p>
            <p className="text-headline-lg text-primary">48</p>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Использовано</p>
            <p className="text-headline-lg text-on-surface-variant">2 / 50</p>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Сброс через</p>
            <p className="text-body-lg text-on-surface">12 дней</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-surface-container">
          <div className="h-full w-[4%] rounded-full bg-primary" />
        </div>
      </Card>

      {/* Payment History */}
      <Card className="p-5">
        <h2 className="text-headline-md mb-4">История платежей</h2>
        <div className="rounded border border-outline-variant">
          <div className="grid grid-cols-4 gap-4 px-4 py-3 text-label-md text-on-surface-variant font-medium border-b border-border-light">
            <span>Дата</span>
            <span>Описание</span>
            <span>Сумма</span>
            <span>Статус</span>
          </div>
          <div className="flex items-center justify-center py-8 text-body-md text-outline">
            Нет платежей. Всё впереди!
          </div>
        </div>
      </Card>
    </div>
  );
}
