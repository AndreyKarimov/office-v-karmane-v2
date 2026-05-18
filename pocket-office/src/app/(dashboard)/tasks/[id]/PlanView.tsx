"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { approvePlan, rejectPlan } from "@/lib/ai-manager-actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

export function PlanView({
  plan,
  taskStatus,
  taskId,
}: {
  plan: Plan;
  taskStatus: string;
  taskId: string;
}) {
  const router = useRouter();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    await approvePlan(taskId);
    setLoading(false);
    router.refresh();
  }

  async function handleReject() {
    if (!reason.trim()) return;
    setLoading(true);
    await rejectPlan(taskId, reason.trim());
    setLoading(false);
    setRejectOpen(false);
    setReason("");
    router.refresh();
  }

  return (
    <div>
      {plan.summary && (
        <p className="text-body-md text-on-surface-variant mb-4">
          {plan.summary}
        </p>
      )}

      <div className="bg-surface-container rounded p-4 mb-4">
        <h3 className="text-label-md font-semibold text-on-surface mb-2">
          Подзадачи
        </h3>
        <ul className="space-y-2">
          {plan.subtasks.map((st, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded border border-outline-variant bg-white p-3"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-container text-label-sm text-on-surface-variant shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-body-md font-medium">{st.title}</span>
                  {st.estimatedHours > 0 && (
                    <span className="text-label-sm text-on-surface-variant shrink-0">
                      ~{st.estimatedHours}ч
                    </span>
                  )}
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
          ))}
        </ul>
      </div>

      {taskStatus === "PENDING_APPROVAL" && (
        <div className="flex gap-3">
          <Button onClick={handleApprove} disabled={loading}>
            Утвердить план
          </Button>
          <Button variant="ghost" disabled={loading}>
            Редактировать
          </Button>
          <Button
            variant="danger"
            onClick={() => setRejectOpen(true)}
            disabled={loading}
          >
            Отклонить
          </Button>
        </div>
      )}

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4">
            <h3 className="text-headline-sm mb-3">Отклонить план</h3>
            <p className="text-body-md text-on-surface-variant mb-4">
              Укажите причину отклонения:
            </p>
            <textarea
              className="w-full h-24 rounded border border-outline-variant bg-[#F8FAFC] px-3 py-2 text-body-md outline-none focus:border-primary resize-none"
              placeholder="Что нужно изменить в плане?"
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
                onClick={handleReject}
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
