"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignTask } from "@/lib/ai-manager-actions";

interface Member {
  id: string;
  name: string;
  type: "human" | "ai";
}

export function AssigneeSelect({
  taskId,
  currentAssigneeId,
  members,
}: {
  taskId: string;
  currentAssigneeId: string | null;
  members: Member[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLoading(true);
    await assignTask(taskId, e.target.value);
    setLoading(false);
    router.refresh();
  }

  return (
    <select
      className="h-8 rounded border border-outline-variant bg-[#F8FAFC] px-2 text-body-md text-on-surface outline-none focus:border-primary cursor-pointer max-w-[160px]"
      value={currentAssigneeId || ""}
      onChange={handleChange}
      disabled={loading}
    >
      <option value="">Не назначен</option>
      {members
        .filter((m) => m.type === "human")
        .map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      {members.filter((m) => m.type === "ai").length > 0 && (
        <>
          <option disabled>── ИИ-сотрудники ──</option>
          {members
            .filter((m) => m.type === "ai")
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
        </>
      )}
    </select>
  );
}
