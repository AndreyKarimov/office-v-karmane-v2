import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

const team = [
  { name: "ИИ-Аналитик", role: "Анализ данных", skills: "SQL, Excel, статистика", status: "BUSY" },
  { name: "ИИ-Копирайтер", role: "Тексты и контент", skills: "Copywriting, SEO, PR", status: "IDLE" },
  { name: "ИИ-Исследователь", role: "Research и бенчмаркинг", skills: "Web search, summarization", status: "IDLE" },
  { name: "ИИ-Менеджер", role: "Оркестрация задач", skills: "Декомпозиция, планирование", status: "BUSY" },
];

export default function TeamPage() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg">Моя команда</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Управляйте ИИ-сотрудниками — нанимайте, настраивайте, контролируйте
          </p>
        </div>
        <Button variant="ai" size="sm">+ Нанять сотрудника</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((member) => (
          <Card key={member.name} hover className="p-5">
            <div className="flex items-start justify-between mb-3">
              <Avatar name={member.name} isAI size="lg" />
              <Chip variant={member.status === "BUSY" ? "ai" : "success"}>
                {member.status === "BUSY" ? "Занят" : "Свободен"}
              </Chip>
            </div>

            <h3 className="text-body-lg font-semibold text-on-surface">{member.name}</h3>
            <p className="text-body-md text-secondary mb-3">{member.role}</p>

            <div className="flex flex-wrap gap-1 mb-4">
              {member.skills.split(", ").map((skill) => (
                <Chip key={skill} variant="default">{skill}</Chip>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1">Настроить</Button>
              <Button variant="ghost" size="sm" className="flex-1">Задачи</Button>
            </div>
          </Card>
        ))}

        {/* Hire card */}
        <Card className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-outline-variant bg-transparent min-h-[200px]">
          <div className="text-3xl mb-2 opacity-30">🤖+</div>
          <p className="text-body-md text-outline mb-3">Нанять ИИ-сотрудника</p>
          <Button variant="ai" size="sm">Создать</Button>
        </Card>
      </div>
    </div>
  );
}
