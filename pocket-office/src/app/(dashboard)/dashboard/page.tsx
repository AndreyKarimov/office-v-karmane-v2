import { Button } from "@/components/ui/Button";
import { KanbanBoard } from "@/components/kanban";
import { getTasks, getProjects } from "@/lib/task-actions";
import { AddProjectButton } from "./AddProjectButton";
import Link from "next/link";

export default async function DashboardPage() {
  const tasks = await getTasks();
  const projects = await getProjects();

  return (
    <div className="flex h-full">
      <aside className="hidden lg:flex lg:w-52 xl:w-60 flex-col border-r border-border-light bg-surface py-4 px-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-label-md font-semibold text-on-surface uppercase">Проекты</h2>
          <AddProjectButton />
        </div>
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded px-3 py-2 text-body-md text-on-surface hover:bg-surface-container transition-colors cursor-default mb-0.5"
          >
            <span>{p.name}</span>
            <span className="text-label-sm text-on-surface-variant">{p._count.tasks}</span>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-body-md text-on-surface-variant px-3 py-4">
            Нет проектов
          </p>
        )}
      </aside>

      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
          <h1 className="text-headline-md">
            {projects[0]?.name || "Дашборд"}
          </h1>
          <Link href="/new-task">
            <Button size="sm">+ Новая задача</Button>
          </Link>
        </div>

        <KanbanBoard tasks={tasks} />
      </div>
    </div>
  );
}
