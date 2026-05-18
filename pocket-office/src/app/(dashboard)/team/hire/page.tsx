"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { hireAICoworker } from "@/lib/ai-coworker-actions";
import Link from "next/link";

function generatePromptTemplate(role: string, skills: string, tasks: string): string {
  const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean);
  return [
    `Ты — ${role}. Твоя задача — помогать пользователю с задачами в роли ${role}.`,
    "",
    skillList.length > 0 ? `Твои ключевые навыки: ${skillList.join(", ")}.` : "",
    tasks ? `Типичные задачи: ${tasks}.` : "",
    "",
    "Правила работы:",
    "- Отвечай чётко и по делу",
    "- Если не уверен — уточни у пользователя",
    "- Соблюдай деловой стиль общения",
    "- Результат оформляй структурированно",
  ].filter(Boolean).join("\n");
}

export default function HirePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [tasks, setTasks] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [llmModel, setLlmModel] = useState("openrouter/free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleGeneratePrompt() {
    if (!role.trim() || !skills.trim()) return;
    setSystemPrompt(generatePromptTemplate(role, skills, tasks));
    setStep(2);
  }

  async function handleHire() {
    if (!name.trim() || !role.trim()) {
      setError("Имя и роль обязательны");
      return;
    }
    setLoading(true);
    setError("");

    const result = await hireAICoworker({
      name,
      role,
      skills,
      systemPrompt,
      llmModel,
    });

    setLoading(false);

    if (result.success) {
      router.push("/dashboard/team");
      router.refresh();
    } else {
      setError(result.error || "Ошибка найма");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <nav className="text-label-md text-on-surface-variant mb-4">
        <Link href="/dashboard/team" className="hover:text-primary">
          Моя команда
        </Link>
        <span className="mx-2">/</span>
        <span className="text-on-surface">Найм сотрудника</span>
      </nav>

      <Card className="p-6">
        <h1 className="text-headline-md mb-6">Нанять ИИ-сотрудника</h1>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Input
              label="Имя сотрудника"
              placeholder="Например: ИИ-Маркетолог"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Роль"
              placeholder="Например: Маркетолог, Аналитик, Разработчик"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            <Input
              label="Навыки (через запятую)"
              placeholder="Например: SEO, контент-маркетинг, аналитика"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />

            <div className="flex flex-col gap-2">
              <label className="text-body-md text-on-surface font-medium">
                Типичные задачи
              </label>
              <textarea
                className="h-20 rounded border border-outline-variant bg-[#F8FAFC] px-3 py-2 text-body-md outline-none focus:border-primary resize-none"
                placeholder="Опишите типичные задачи сотрудника..."
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-body-md text-on-surface font-medium">
                LLM-модель
              </label>
              <select
                className="h-10 rounded border border-outline-variant bg-[#F8FAFC] px-3 text-body-md outline-none focus:border-primary cursor-pointer"
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
              >
                <option value="openrouter/free">OpenRouter Free</option>
                <option value="deepseek/deepseek-chat">DeepSeek Chat</option>
                <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleGeneratePrompt} disabled={!role.trim() || !skills.trim()}>
                Сгенерировать промпт и продолжить
              </Button>
              <Link href="/dashboard/team">
                <Button variant="ghost" type="button">Отмена</Button>
              </Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-body-md text-on-surface font-medium">
                Системный промпт
              </label>
              <textarea
                className="h-40 rounded border border-outline-variant bg-[#F8FAFC] px-3 py-2 text-body-md outline-none focus:border-primary resize-none font-mono text-sm"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
              />
              <p className="text-label-sm text-on-surface-variant">
                Отредактируйте промпт при необходимости. Он определяет поведение ИИ-сотрудника.
              </p>
            </div>

            {error && (
              <p className="text-label-md text-error bg-error-container/20 rounded p-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={handleHire} disabled={loading || !systemPrompt.trim()}>
                {loading ? "Создание..." : "Нанять сотрудника"}
              </Button>
              <Button variant="ghost" onClick={() => setStep(1)} disabled={loading}>
                Назад
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
