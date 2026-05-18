"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import {
  approvePlan,
  rejectPlan,
  acceptTask,
  rejectFromReview,
  updateSubtaskStatus,
} from "@/lib/ai-manager-actions";

interface SubtaskPlan {
  title: string;
  description: string;
  assigneeRole: string;
  estimatedHours: number;
  dependencies: string[];
}

interface Plan {
  subtasks: SubtaskPlan[];
  summary: string;
}

const subtaskStatusLabels: Record<string, string> = {
  TODO: "Ожидает",
  IN_PROGRESS: "В работе",
  DONE: "Готово",
};

const subtaskStatusVariants: Record<string, "default" | "warning" | "success"> = {
  TODO: "default",
  IN_PROGRESS: "warning",
  DONE: "success",
};

interface SubtaskData {
  id: string;
  title: string;
  status: string;
}

export function PlanView({
  plan,
  taskStatus,
  taskId,
  subtasks,
}: {
  plan: Plan;
  taskStatus: string;
  taskId: string;
  subtasks: SubtaskData[];
}) {
  const router = useRouter();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectMode, setRejectMode] = useState<"plan" | "review">("plan");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const doneCount = subtasks.filter((s) => s.status === "DONE").length;
  const totalCount = subtasks.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  async function handleApprove() {
    setLoading(true);
    await approvePlan(taskId);
    setLoading(false);
    router.refresh();
  }

  async function handleRejectPlan() {
    if (!reason.trim()) return;
    setLoading(true);
    await rejectPlan(taskId, reason.trim());
    setLoading(false);
    setRejectOpen(false);
    setReason("");
    router.refresh();
  }

  async function handleAccept() {
    setLoading(true);
    await acceptTask(taskId);
    setLoading(false);
    router.refresh();
  }

  async function handleRejectReview() {
    if (!reason.trim()) return;
    setLoading(true);
    await rejectFromReview(taskId, reason.trim());
    setLoading(false);
    setRejectOpen(false);
    setReason("");
    router.refresh();
  }

  async function toggleSubtaskStatus(subtaskId: string, currentStatus: string) {
    const next: Record<string, string> = {
      TODO: "IN_PROGRESS",
      IN_PROGRESS: "DONE",
      DONE: "TODO",
    };
    setLoading(true);
    await updateSubtaskStatus(subtaskId, next[currentStatus] || "TODO");
    setLoading(false);
    router.refresh();
  }

  function getSubtaskStatus(subtaskTitle: string): string {
    const found = subtasks.find(
      (s) => s.title === subtaskTitle,
    );
    return found?.status || "TODO";
  }

  function getSubtaskId(subtaskTitle: string): string | undefined {
    return subtasks.find((s) => s.title === subtaskTitle)?.id;
  }

  return (
    <div>
      {plan.summary && (
        <p className="text-body-md text-on-surface-variant mb-4">
          {plan.summary}
        </p>
      )}

      {totalCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-label-sm text-on-surface-variant">
              Прогресс: {doneCount}/{totalCount} ({progress}%)
            </span>
          </div>
          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="bg-surface-container rounded p-4 mb-4">
        <h3 className="text-label-md font-semibold text-on-surface mb-2">
          Подзадачи
        </h3>
        <ul className="space-y-2">
          {plan.subtasks.map((st, i) => {
            const status = getSubtaskStatus(st.title);
            const subtaskId = getSubtaskId(st.title);
            return (
              <li
                key={i}
                className={`flex items-start gap-3 rounded border p-3 transition-colors ${
                  status === "DONE"
                    ? "border-emerald-200 bg-emerald-50/30"
                    : "border-outline-variant bg-white"
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-container text-label-sm text-on-surface-variant shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-body-md font-medium ${
                        status === "DONE" ? "line-through text-on-surface-variant" : ""
                      }`}
                    >
                      {st.title}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {st.estimatedHours > 0 && (
                        <span className="text-label-sm text-on-surface-variant">
                          ~{st.estimatedHours}ч
                        </span>
                      )}
                      {subtaskId && (taskStatus === "IN_PROGRESS" || taskStatus === "REVIEW") && (
                        <button
                          className="cursor-pointer"
                          onClick={() => toggleSubtaskStatus(subtaskId, status)}
                          disabled={loading}
                          title={`Статус: ${subtaskStatusLabels[status]}. Нажмите для смены.`}
                        >
                          <Chip variant={subtaskStatusVariants[status] || "default"}>
                            {subtaskStatusLabels[status] || status}
                          </Chip>
                        </button>
                      )}
                    </div>
                  </div>
                  {st.description && (
                    <p className="text-body-sm text-on-surface-variant mt-1">
                      {st.description}
                    </p>
                  )}
                  {st.dependencies.length > 0 && (
                    <p className="text-label-sm text-amber-700 mt-1">
                      Зависит от: {st.dependencies.join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Avatar
                    name={st.assigneeRole}
                    isAI={st.assigneeRole !== "Human"}
                    size="sm"
                  />
                  <span className="text-label-sm text-on-surface-variant hidden sm:inline">
                    {st.assigneeRole}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {taskStatus === "PENDING_APPROVAL" && (
        <div className="flex gap-3 flex-wrap">
          <Button onClick={handleApprove} disabled={loading}>
            Утвердить план
          </Button>
          <Button variant="ghost" disabled={loading}>
            Редактировать
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setRejectMode("plan");
              setRejectOpen(true);
            }}
            disabled={loading}
          >
            Отклонить
          </Button>
        </div>
      )}

      {taskStatus === "REVIEW" && (
        <div className="flex gap-3 flex-wrap">
          <Button onClick={handleAccept} disabled={loading}>
            Принять задачу
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setRejectMode("review");
              setRejectOpen(true);
            }}
            disabled={loading}
          >
            Отклонить на доработку
          </Button>
        </div>
      )}

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4">
            <h3 className="text-headline-sm mb-3">
              {rejectMode === "plan" ? "Отклонить план" : "Отклонить задачу"}
            </h3>
            <p className="text-body-md text-on-surface-variant mb-4">
              {rejectMode === "plan"
                ? "Укажите причину отклонения плана:"
                : "Укажите, что нужно доработать:"}
            </p>
            <textarea
              className="w-full h-24 rounded border border-outline-variant bg-[#F8FAFC] px-3 py-2 text-body-md outline-none focus:border-primary resize-none"
              placeholder={
                rejectMode === "plan"
                  ? "Что нужно изменить в плане?"
                  : "Что требует доработки?"
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 mt-4 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRejectOpen(false);
                  setReason("");
                }}
              >
                Отмена
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={
                  rejectMode === "plan" ? handleRejectPlan : handleRejectReview
                }
                disabled={!reason.trim() || loading}
              >
                Отклонить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
