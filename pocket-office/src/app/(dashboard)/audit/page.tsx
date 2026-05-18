import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const logs = [
  { action: "task.created", entity: "Задача #1", user: "Андрей", time: "10:32" },
  { action: "task.status_changed", entity: "Задача #1 → На анализе", user: "ИИ-Менеджер", time: "10:32" },
  { action: "ai.plan_generated", entity: "Задача #1", user: "ИИ-Менеджер", time: "10:33" },
  { action: "task.comment_added", entity: "Задача #1", user: "Андрей", time: "10:35" },
  { action: "ai.question_asked", entity: "Задача #1", user: "ИИ-Менеджер", time: "10:35" },
];

export default function AuditPage() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg">Аудит</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Журнал всех действий в системе</p>
        </div>
        <Button variant="ghost" size="sm">📥 Экспорт CSV</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-body-md">
            <thead>
              <tr className="border-b border-border-light text-left">
                <th className="px-4 py-3 text-label-md text-on-surface-variant font-medium">Действие</th>
                <th className="px-4 py-3 text-label-md text-on-surface-variant font-medium">Объект</th>
                <th className="px-4 py-3 text-label-md text-on-surface-variant font-medium">Пользователь</th>
                <th className="px-4 py-3 text-label-md text-on-surface-variant font-medium text-right">Время</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3"><code className="text-label-sm bg-surface-container rounded px-1.5 py-0.5">{log.action}</code></td>
                  <td className="px-4 py-3 text-on-surface">{log.entity}</td>
                  <td className="px-4 py-3">
                    <span className={log.user.startsWith("ИИ") ? "text-secondary" : "text-on-surface"}>
                      {log.user}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant text-right">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
