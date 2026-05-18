"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/task-actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function AddProjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    try {
      await createProject(name.trim());
      setOpen(false);
      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className="text-primary hover:bg-primary/10 rounded p-1 cursor-pointer"
        aria-label="Добавить проект"
        onClick={() => setOpen(true)}
      >
        +
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-headline-sm mb-3">Новый проект</h3>
            <Input
              label="Название проекта"
              placeholder="Например: Маркетинг Q2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
            {error && (
              <p className="text-label-md text-error mt-2">{error}</p>
            )}
            <div className="flex gap-2 mt-4 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  setName("");
                }}
              >
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!name.trim() || loading}
              >
                Создать
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
