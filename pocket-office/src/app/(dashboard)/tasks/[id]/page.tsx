import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { getTaskById } from "@/lib/task-actions";
import { getComments } from "@/lib/comment-actions";
import { getAssignableMembers } from "@/lib/ai-manager-actions";
import { TaskActions } from "./TaskActions";
import { CommentSection } from "./CommentSection";
import { PlanView } from "./PlanView";
import { AssigneeSelect } from "./AssigneeSelect";
import Link from "next/link";
import { notFound } from "next/navigation";

const statusLabels: Record<string, string> = {
  BACKLOG: "Бэклог",
  ANALYZING: "На анализе",
  PENDING_APPROVAL: "На утверждении",
  IN_PROGRESS: "В работе",
  REVIEW: "На приёмке",
  CLOSED: "Закрыто",
};

const statusVariants: Record<string, "default" | "warning" | "success" | "error"> = {
  BACKLOG: "default",
  ANALYZING: "warning",
  PENDING_APPROVAL: "warning",
  IN_PROGRESS: "success",
  REVIEW: "success",
  CLOSED: "default",
};

const priorityLabels: Record<string, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
  CRITICAL: "Критичный",
};

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) notFound();

  const comments = await getComments(id);
  const plan = task.plan ? JSON.parse(task.plan as string) : null;
  const members = await getAssignableMembers();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <nav
        className="text-label-md text-on-surface-variant mb-4"
        aria-label="Навигация"
      >
        <Link href="/dashboard" className="hover:text-primary">
          Дашборд
        </Link>
        <span className="mx-2">/</span>
        <span className="text-on-surface">Задача #{id.slice(0, 8)}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg">{task.title}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Chip variant={statusVariants[task.status] || "default"}>
              {statusLabels[task.status] || task.status}
            </Chip>
            {task.priority !== "MEDIUM" && (
              <Chip variant="error">
                {priorityLabels[task.priority] || task.priority}
              </Chip>
            )}
          </div>
        </div>
        <TaskActions taskId={task.id} status={task.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          {task.description && (
            <Card className="p-5">
              <h2 className="text-headline-md mb-3">Описание</h2>
              <p className="text-body-md text-on-surface-variant whitespace-pre-wrap">
                {task.description}
              </p>
            </Card>
          )}

          {plan && (
            <Card className="p-5 border-secondary/30">
              <div className="flex items-center gap-2 mb-3">
                <Avatar name="ИИ-Менеджер" isAI size="md" />
                <div>
                  <span className="text-body-md font-medium text-on-surface">
                    ИИ-Менеджер
                  </span>
                  <p className="text-label-sm text-secondary">План выполнения</p>
                </div>
              </div>
              <PlanView
                plan={plan}
                taskStatus={task.status}
                taskId={task.id}
                subtasks={task.subtasks.map((s) => ({
                  id: s.id,
                  title: s.title,
                  status: s.status,
                }))}
              />
            </Card>
          )}

          {(task.status === "ANALYZING" || task.status === "PENDING_APPROVAL") && !plan && (
            <Card className="p-5 border-secondary/30">
              <div className="flex items-center gap-2 mb-3">
                <Avatar name="ИИ-Менеджер" isAI size="md" />
                <div>
                  <span className="text-body-md font-medium text-on-surface">
                    ИИ-Менеджер
                  </span>
                  <p className="text-label-sm text-secondary">
                    {task.status === "ANALYZING" ? "Анализ задачи" : "Ожидание"}
                  </p>
                </div>
              </div>
              <p className="text-body-md text-on-surface-variant">
                {task.status === "ANALYZING"
                  ? "ИИ-Менеджер анализирует задачу. План появится здесь после завершения анализа."
                  : "Задача ожидает утверждения плана."}
              </p>
            </Card>
          )}

          <CommentSection
            taskId={task.id}
            initialComments={comments}
            taskStatus={task.status}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h3 className="text-label-md font-semibold text-on-surface mb-3">
              Детали
            </h3>
            <dl className="space-y-3 text-body-md">
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Статус</dt>
                <dd>
                  <Chip variant={statusVariants[task.status] || "default"}>
                    {statusLabels[task.status] || task.status}
                  </Chip>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Приоритет</dt>
                <dd className="text-on-surface">
                  {priorityLabels[task.priority] || task.priority}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Проект</dt>
                <dd className="text-on-surface">{task.project?.name || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Ответственный</dt>
                <dd className="text-on-surface">
                  {task.status !== "CLOSED" ? (
                    <AssigneeSelect
                      taskId={task.id}
                      currentAssigneeId={task.assigneeId}
                      members={members}
                    />
                  ) : (
                    task.assignee?.name || "Не назначен"
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Создана</dt>
                <dd className="text-on-surface">
                  {new Date(task.createdAt).toLocaleDateString("ru-RU")}
                </dd>
              </div>
            </dl>
          </Card>

          {task.logs.length > 0 && (
            <Card className="p-4">
              <h3 className="text-label-md font-semibold text-on-surface mb-3">
                История
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {task.logs.map((log) => (
                  <div key={log.id} className="text-body-md">
                    <p className="text-on-surface">
                      {log.fromStatus
                        ? `${statusLabels[log.fromStatus] || log.fromStatus} → ${statusLabels[log.toStatus] || log.toStatus}`
                        : `Статус: ${statusLabels[log.toStatus] || log.toStatus}`}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      {new Date(log.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
