"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createTask } from "@/lib/task-actions";
import { runAIAnalysis } from "@/lib/ai-manager-actions";

export function CreateTaskForm({
  projects,
}: {
  projects: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Название задачи обязательно");
      return;
    }
    if (!projectId) {
      setError("Выберите проект");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const task = await createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        projectId,
      });

      await runAIAnalysis(task.id);

      router.push(`/tasks/${task.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания задачи");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Название задачи"
        placeholder="Что нужно сделать?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
        autoFocus
      />

      <div className="flex flex-col gap-2">
        <label
          htmlFor="description"
          className="text-body-md text-on-surface font-medium"
        >
          Описание
        </label>
        <textarea
          id="description"
          className="h-28 rounded border border-outline-variant bg-[#F8FAFC] px-3 py-2 text-body-md text-on-surface placeholder:text-outline outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
          placeholder="Опишите задачу подробнее..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="project"
            className="text-body-md text-on-surface font-medium"
          >
            Проект
          </label>
          <select
            id="project"
            className="h-10 rounded border border-outline-variant bg-[#F8FAFC] px-3 text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={loading}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="priority"
            className="text-body-md text-on-surface font-medium"
          >
            Приоритет
          </label>
          <select
            id="priority"
            className="h-10 rounded border border-outline-variant bg-[#F8FAFC] px-3 text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={loading}
          >
            <option value="LOW">Низкий</option>
            <option value="MEDIUM">Средний</option>
            <option value="HIGH">Высокий</option>
            <option value="CRITICAL">Критичный</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="text-label-md text-error bg-error-container/20 rounded p-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Создание..." : "Создать задачу"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={loading}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
