import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 h-16 border-b border-border-light bg-white/95">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-primary text-on-primary font-bold">
            ОК
          </div>
          <span className="font-semibold text-on-surface text-body-lg">Офис в кармане</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Войти</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Регистрация</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-16 md:py-24 text-center">
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-label-md text-primary">
              AI-Powered Project Management
            </span>
          </div>
          <h1 className="text-headline-lg mb-4 max-w-2xl mx-auto text-balance">
            Ваш персональный ИИ-офис. Управляйте задачами и командой из ИИ-сотрудников
          </h1>
          <p className="text-body-lg text-on-surface-variant mb-8 max-w-xl mx-auto text-balance">
            Создайте задачу — ИИ-менеджер проанализирует, декомпозирует и распределит работу между ИИ-сотрудниками. А вы контролируете результат на канбан-доске.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Начать бесплатно</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="lg">Войти в аккаунт</Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white border-t border-border-light py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-headline-md text-center mb-10">Как это работает</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Создайте задачу",
                  desc: "Опишите задачу текстом. ИИ-менеджер проанализирует и уточнит детали.",
                },
                {
                  step: "2",
                  title: "Утвердите план",
                  desc: "ИИ предложит декомпозицию на подзадачи. Вы утверждаете или корректируете.",
                },
                {
                  step: "3",
                  title: "Контролируйте",
                  desc: "ИИ-сотрудники выполняют подзадачи. Канбан-доска показывает прогресс.",
                },
              ].map((f) => (
                <div key={f.step} className="card p-6 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold mx-auto mb-4">
                    {f.step}
                  </div>
                  <h3 className="text-body-lg font-semibold text-on-surface mb-2">{f.title}</h3>
                  <p className="text-body-md text-on-surface-variant">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-light py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-body-md text-on-surface-variant">
          © 2026 Офис в кармане. Платформа оркестрации ИИ-команд.
        </div>
      </footer>
    </div>
  );
}
