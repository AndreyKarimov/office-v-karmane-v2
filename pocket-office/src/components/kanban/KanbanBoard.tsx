"use client";

import { useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./KanbanColumn";
import { updateTaskStatus } from "@/lib/task-actions";
import type { TaskData } from "@/lib/task-actions";

const columns = [
  "BACKLOG",
  "ANALYZING",
  "PENDING_APPROVAL",
  "IN_PROGRESS",
  "REVIEW",
  "CLOSED",
];

export function KanbanBoard({ tasks }: { tasks: TaskData[] }) {
  const grouped = columns.reduce<Record<string, TaskData[]>>((acc, col) => {
    acc[col] = tasks.filter((t) => t.status === col);
    return acc;
  }, {});

  const handleDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    if (destination.droppableId !== result.source.droppableId) {
      await updateTaskStatus(draggableId, destination.droppableId);
    }
  }, []);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-0 overflow-x-auto p-4 min-h-[calc(100vh-8rem)]">
        {columns.map((col) => (
          <KanbanColumn key={col} columnId={col} tasks={grouped[col] || []} />
        ))}
      </div>
    </DragDropContext>
  );
}
