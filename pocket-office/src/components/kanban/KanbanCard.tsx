"use client";

import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import type { TaskData } from "@/lib/task-actions";

const priorityLabels: Record<string, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
  CRITICAL: "Критичный",
};

const priorityVariants: Record<string, "default" | "success" | "error" | "warning"> = {
  LOW: "default",
  MEDIUM: "default",
  HIGH: "error",
  CRITICAL: "error",
};

export function KanbanCard({ task }: { task: TaskData }) {
  return (
    <Card hover className="p-3 cursor-grab active:cursor-grabbing">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-body-md font-medium text-on-surface leading-tight">
          {task.title}
        </span>
        {task.priority !== "MEDIUM" && (
          <Chip variant={priorityVariants[task.priority] || "default"} className="shrink-0">
            {priorityLabels[task.priority] || task.priority}
          </Chip>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Avatar
          name={task.assignee?.name || "—"}
          size="sm"
        />
        <span className="text-label-md text-on-surface-variant">
          {task.assignee?.name || "Не назначен"}
        </span>
      </div>
    </Card>
  );
}
