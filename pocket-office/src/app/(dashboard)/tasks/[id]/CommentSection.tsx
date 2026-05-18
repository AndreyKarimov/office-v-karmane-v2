"use client";

import { useState, useRef } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { createComment, type CommentData } from "@/lib/comment-actions";
import { processUserAnswer } from "@/lib/ai-manager-actions";
import { useRouter } from "next/navigation";

export function CommentSection({
  taskId,
  initialComments,
  taskStatus,
}: {
  taskId: string;
  initialComments: CommentData[];
  taskStatus: string;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  async function handleSend() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");

    try {
      const comment = await createComment(taskId, text.trim());
      setComments((prev) => [...prev, comment]);
      setText("");

      if (taskStatus === "ANALYZING") {
        const result = await processUserAnswer(taskId, text.trim());
        if (!result.success) {
          setError(result.message);
        }
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 1) return "только что";
    if (mins < 60) return `${mins} мин назад`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч назад`;
    return new Date(date).toLocaleString("ru-RU");
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={listRef}
        className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1"
      >
        {comments.length === 0 && (
          <p className="text-body-md text-on-surface-variant text-center py-4">
            Комментариев пока нет
          </p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <Avatar
              name={c.user.name || "—"}
              isAI={c.isAI}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className={`text-label-md font-medium ${c.isAI ? "text-secondary" : "text-on-surface"}`}
                >
                  {c.user.name || "—"}
                </span>
                <span className="text-label-sm text-on-surface-variant">
                  {formatTime(c.createdAt)}
                </span>
              </div>
              <div className="text-body-md mt-1 whitespace-pre-wrap break-words">
                {c.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 h-10 rounded border border-outline-variant bg-[#F8FAFC] px-3 text-body-md outline-none focus:border-primary"
          placeholder="Напишите комментарий..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <Button size="sm" onClick={handleSend} disabled={loading || !text.trim()}>
          →
        </Button>
      </div>

      {error && (
        <p className="text-label-md text-error">{error}</p>
      )}
    </div>
  );
}
