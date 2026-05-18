"use client";

import { useState, useActionState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { completeOnboarding } from "@/lib/onboarding-actions";

const questions = [
  {
    id: 1,
    label: "Ваша роль",
    field: "role",
    options: ["CEO / Основатель", "Менеджер проектов", "Тимлид", "Соло-предприниматель", "Другое"],
  },
  {
    id: 2,
    label: "Сколько задач вы обрабатываете в неделю?",
    field: "tasksPerWeek",
    options: ["До 10", "10–30", "30–100", "100+"],
  },
  {
    id: 3,
    label: "Что вас больше всего беспокоит в управлении задачами?",
    field: "concern",
    options: ["Хаос и потеря фокуса", "Долгая декомпозиция", "Контроль исполнения", "Не хватает рук"],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const [state, formAction, pending] = useActionState(completeOnboarding, {
    success: false,
  });

  const handleAnswer = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStep((s) => s + 1);
  }, []);

  useEffect(() => {
    if (state.success) {
      router.push("/dashboard");
    }
  }, [state, router]);

  if (step < questions.length) {
    const question = questions[step];

    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-surface px-4 py-8">
        <Card className="w-full max-w-md p-6 md:p-8">
          <div className="mb-6">
            <div className="text-label-sm text-on-surface-variant mb-2">
              Шаг {step + 1} из {questions.length}
            </div>
            <div className="flex gap-1 mb-4">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-surface-container-high"}`}
                />
              ))}
            </div>
            <h1 className="text-headline-md mb-1">{question.label}</h1>
          </div>

          <div className="flex flex-col gap-2">
            {question.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(question.field, option)}
                className="w-full rounded border border-outline-variant px-4 py-3 text-body-md text-left hover:bg-surface-container hover:border-primary/30 transition-colors cursor-pointer"
              >
                {option}
              </button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-surface px-4 py-8">
      <Card className="w-full max-w-md p-6 text-center animate-in fade-in">
        <div className="text-4xl mb-3">🎯</div>
        <h2 className="text-headline-md mb-2">Отлично!</h2>
        <p className="text-body-md text-on-surface-variant mb-4">
          Сейчас мы создадим демо-проект под ваши задачи.
        </p>

        {state.error && (
          <p className="text-label-sm text-error bg-error/10 rounded p-2 mb-4">{state.error}</p>
        )}

        <form action={formAction}>
          {Object.entries(formData).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Создаём проект..." : "Создать демо-проект"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
