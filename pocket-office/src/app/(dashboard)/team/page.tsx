import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { getAICoworkers } from "@/lib/ai-coworker-actions";
import Link from "next/link";

export default async function TeamPage() {
  const coworkers = await getAICoworkers();

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg">Моя команда</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Управляйте ИИ-сотрудниками — нанимайте, настраивайте, контролируйте
          </p>
        </div>
        <Link href="/team/hire">
          <Button variant="ai" size="sm">+ Нанять сотрудника</Button>
        </Link>
      </div>

      {coworkers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🤖</div>
          <h2 className="text-headline-sm mb-2">ИИ-сотрудников пока нет</h2>
          <p className="text-body-md text-on-surface-variant mb-4">
            Наймите первого ИИ-сотрудника, чтобы он мог выполнять подзадачи
          </p>
          <Link href="/team/hire">
            <Button variant="ai">Нанять сотрудника</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coworkers.map((cw) => {
          const skills: string[] = JSON.parse(cw.skills || "[]");
          return (
            <Card key={cw.id} hover className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Avatar name={cw.name} isAI size="lg" />
                <Chip variant={cw.status === "BUSY" ? "ai" : "success"}>
                  {cw.status === "BUSY" ? "Занят" : cw.status === "IDLE" ? "Свободен" : "Офлайн"}
                </Chip>
              </div>

              <h3 className="text-body-lg font-semibold text-on-surface">{cw.name}</h3>
              <p className="text-body-md text-secondary mb-3">{cw.role}</p>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {skills.map((skill) => (
                    <Chip key={skill} variant="default">{skill}</Chip>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-4">
                <span>LLM: {cw.llmModel}</span>
                <span>·</span>
                <span>Задач: {cw._count.subtasks}</span>
              </div>
            </Card>
          );
        })}

        <Link href="/team/hire">
          <Card className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-outline-variant bg-transparent min-h-[200px] cursor-pointer hover:border-secondary/50 transition-colors">
            <div className="text-3xl mb-2 opacity-30">🤖+</div>
            <p className="text-body-md text-outline mb-3">Нанять ИИ-сотрудника</p>
            <Button variant="ai" size="sm">Создать</Button>
          </Card>
        </Link>
      </div>
    </div>
  );
}
