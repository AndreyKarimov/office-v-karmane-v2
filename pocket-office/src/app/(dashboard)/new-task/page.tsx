import { Card } from "@/components/ui/Card";
import { getProjects } from "@/lib/task-actions";
import { CreateTaskForm } from "./CreateTaskForm";

export default async function NewTaskPage() {
  const projects = await getProjects();

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <nav
        className="text-label-md text-on-surface-variant mb-4"
        aria-label="Навигация"
      >
        <a href="/dashboard" className="hover:text-primary">
          Дашборд
        </a>
        <span className="mx-2">/</span>
        <span className="text-on-surface">Новая задача</span>
      </nav>

      <Card className="p-6">
        <h1 className="text-headline-md mb-6">Создание задачи</h1>

        {projects.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">
            Сначала создайте проект, чтобы добавлять задачи.
          </p>
        ) : (
          <CreateTaskForm projects={projects} />
        )}
      </Card>
    </div>
  );
}
