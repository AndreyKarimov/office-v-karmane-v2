"use client";

import { Droppable } from "@hello-pangea/dnd";
import { KanbanCard } from "./KanbanCard";
import type { TaskData } from "@/lib/task-actions";

const statusLabels: Record<string, string> = {
  BACKLOG: "Бэклог",
  ANALYZING: "На анализе",
  PENDING_APPROVAL: "На утверждении",
  IN_PROGRESS: "В работе",
  REVIEW: "На приёмке",
  CLOSED: "Закрыто",
};

export function KanbanColumn({
  columnId,
  tasks,
}: {
  columnId: string;
  tasks: TaskData[];
}) {
  return (
    <div className="flex flex-col min-w-[260px] max-w-[320px] w-full shrink-0">
      <div className="flex items-center gap-2 px-2 mb-3">
        <h3 className="text-label-md font-semibold text-on-surface">
          {statusLabels[columnId] || columnId}
        </h3>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-container text-label-sm text-on-surface-variant px-1.5">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-2 min-h-[120px] rounded-lg transition-colors p-1 ${
              snapshot.isDraggingOver ? "bg-primary/5" : ""
            }`}
          >
            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant p-4 text-center">
                <p className="text-body-md text-outline">Нет задач</p>
              </div>
            )}
            {tasks.map((task) => (
              <KanbanCard key={task.id} task={task} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
