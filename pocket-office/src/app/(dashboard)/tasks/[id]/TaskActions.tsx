"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { approvePlan, rejectPlan } from "@/lib/ai-manager-actions";
import { useRouter } from "next/navigation";

export function TaskActions({
  taskId,
  status,
}: {
  taskId: string;
  status: string;
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
    <div className="flex gap-2 flex-wrap">
      {status === "PENDING_APPROVAL" && (
        <>
          <Button size="sm" onClick={handleApprove} disabled={loading}>
            Утвердить план
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setRejectOpen(true)}
            disabled={loading}
          >
            Отклонить
          </Button>
        </>
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
