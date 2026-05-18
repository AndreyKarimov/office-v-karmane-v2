import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Breadcrumb */}
      <nav className="text-label-md text-on-surface-variant mb-4" aria-label="Навигация">
        <a href="/dashboard" className="hover:text-primary">Дашборд</a>
        <span className="mx-2">/</span>
        <span className="text-on-surface">Задача #{id}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg">Подготовить отчёт по продажам Q1</h1>
          <div className="flex items-center gap-3 mt-2">
            <Chip variant="warning">На анализе</Chip>
            <Chip variant="error">Высокий приоритет</Chip>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">✏️</Button>
          <Button variant="danger" size="sm">Удалить</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Main Content */}
        <div className="flex flex-col gap-6">
          {/* Description */}
          <Card className="p-5">
            <h2 className="text-headline-md mb-3">Описание</h2>
            <p className="text-body-md text-on-surface-variant">
              Необходимо подготовить квартальный отчёт по продажам за Q1 2026.
              Включить: динамику по месяцам, топ-10 клиентов, сравнение с Q1 2025.
              Формат: PDF-презентация, 15-20 слайдов.
            </p>
          </Card>

          {/* AI-Manager Analysis */}
          <Card className="p-5 border-secondary/30">
            <div className="flex items-center gap-2 mb-3">
              <Avatar name="ИИ-Менеджер" isAI size="md" />
              <div>
                <span className="text-body-md font-medium text-on-surface">ИИ-Менеджер</span>
                <p className="text-label-sm text-secondary">Анализ задачи</p>
              </div>
            </div>

            <div className="bg-surface-container rounded p-4 mb-4">
              <h3 className="text-label-md font-semibold text-on-surface mb-2">План декомпозиции</h3>
              <ul className="space-y-2">
                {[
                  { task: "Собрать данные продаж за январь-март", assignee: "ИИ-Аналитик", status: "TODO" },
                  { task: "Подготовить сравнительный анализ Q1 2025", assignee: "ИИ-Исследователь", status: "TODO" },
                  { task: "Сверстать PDF-презентацию", assignee: "Нужен человек", status: "TODO" },
                ].map((st, i) => (
                  <li key={i} className="flex items-center gap-3 rounded border border-outline-variant bg-white p-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-container text-label-sm text-on-surface-variant shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-body-md flex-1">{st.task}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Avatar name={st.assignee} isAI={st.assignee !== "Нужен человек"} size="sm" />
                      <span className="text-label-sm text-on-surface-variant hidden sm:inline">
                        {st.assignee}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <Button>✅ Утвердить план</Button>
              <Button variant="ghost">✏️ Редактировать</Button>
              <Button variant="danger">❌ Отклонить</Button>
            </div>
          </Card>

          {/* Comments */}
          <Card className="p-5">
            <h2 className="text-headline-md mb-4">Комментарии</h2>
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex gap-3">
                <Avatar name="Андрей" size="sm" />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-label-md font-medium text-on-surface">Андрей</span>
                    <span className="text-label-sm text-on-surface-variant">10 мин назад</span>
                  </div>
                  <p className="text-body-md mt-1">Нужно добавить графики по регионам: Москва, СПб, Урал.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Avatar name="ИИ-Менеджер" isAI size="sm" />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-label-md font-medium text-secondary">ИИ-Менеджер</span>
                    <span className="text-label-sm text-on-surface-variant">только что</span>
                  </div>
                  <p className="text-body-md mt-1">
                    Принято. Добавил подзадачу «Собрать региональные данные». Хотите ещё 2 вопроса для уточнения?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                className="flex-1 h-10 rounded border border-outline-variant bg-[#F8FAFC] px-3 text-body-md outline-none focus:border-primary"
                placeholder="Напишите комментарий..."
              />
              <Button size="sm">→</Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h3 className="text-label-md font-semibold text-on-surface mb-3">Детали</h3>
            <dl className="space-y-3 text-body-md">
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Статус</dt>
                <dd><Chip variant="warning">На анализе</Chip></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Приоритет</dt>
                <dd className="text-on-surface">Высокий</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Проект</dt>
                <dd className="text-on-surface">Мой первый проект</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Создана</dt>
                <dd className="text-on-surface">18.05.2026</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-4">
            <h3 className="text-label-md font-semibold text-on-surface mb-3">История</h3>
            <div className="space-y-3">
              {[
                { action: "ИИ-Менеджер сгенерировал план", time: "2 мин назад" },
                { action: "Задача переведена в «На анализе»", time: "5 мин назад" },
                { action: "Задача создана", time: "10 мин назад" },
              ].map((log, i) => (
                <div key={i} className="text-body-md">
                  <p className="text-on-surface">{log.action}</p>
                  <p className="text-label-sm text-on-surface-variant">{log.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
