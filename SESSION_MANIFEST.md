# SESSION_MANIFEST.md — «Офис в кармане»

## Текущий статус

- **Проект:** Платформа оркестрации ИИ-команд «Офис в кармане»
- **Текущий этап:** Спринт 0 (Фундамент) — выполнен. Ожидается Спринт 1 (ИИ-менеджер — анализ).
- **Прогресс:** 35% (Этапы 0, 1, 2, Спринт 0 выполнены)
- **Последний успешный коммит:** N/A (изменения не закоммичены)
- **Текущая ветка:** master

## Быстрые команды

```bash
cd pocket-office
npm run dev       # Запуск dev-сервера Next.js (localhost:3000)
npm run build     # Продакшен-сборка
npm run lint      # ESLint
npx prisma migrate dev  # Миграции БД
npx prisma studio  # Визуальный редактор БД
```

## Ключевые файлы

- `ARCHITECTURE.md` — стек и схема компонентов ✅
- `IMPLEMENTATION_PLAN.md` — полный план реализации (Спринт 0 отмечен [x])
- `SESSION_MANIFEST.md` — этот файл
- `.vibe/context_summary.md` — детальный контекст для следующей сессии
- `pocket-office.md` — исходный PRD
- `referencies/DESIGN.md` — дизайн-токены «Cognitive Enterprise»
- `pocket-office/design/style_analysis.md` — анализ визуального стиля ✅
- `pocket-office/prisma/schema.prisma` — схема БД (11 моделей) ✅
- `pocket-office/src/` — Next.js 16 проект ✅
  - `lib/prisma.ts` — синглтон PrismaClient (libsql adapter)
  - `lib/auth.ts` — конфигурация NextAuth v5 (Credentials + Google)
  - `lib/auth-actions.ts` — server actions (register, login, logout)
  - `lib/task-actions.ts` — server actions (getTasks, createTask, updateTaskStatus, deleteTask, getProjects)
  - `lib/onboarding-actions.ts` — server action (completeOnboarding)
  - `lib/env.ts` — переменные окружения
  - `components/ui/` — Button, Card, Input, Chip, Avatar
  - `components/layout/` — Header (клиентский, с сессией и logout), Sidebar, MobileNav
  - `components/kanban/` — KanbanBoard, KanbanColumn, KanbanCard (drag-and-drop)
  - `components/providers/SessionProvider.tsx` — обёртка NextAuth
  - `app/` — 12 страниц
  - `app/api/auth/[...nextauth]/route.ts` — API-роут NextAuth
  - `middleware.ts` — защита dashboard-роутов, редиректы auth

## Стек

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Prisma 7 + SQLite (dev, через @prisma/adapter-libsql + @libsql/client)
- NextAuth.js v5 beta (email/Google)
- OpenRouter API → `openrouter/free` (OpenAI SDK с кастомным baseURL)
- Vercel + Supabase

## Этапы и прогресс

| Этап | Название | Статус |
|------|----------|--------|
| 0 | Инициализация инструментария | ✅ |
| 1 | Архитектура и проект | ✅ |
| 2 | Дизайн и вёрстка UI | ✅ |
| 3.0 | Спринт 0: Фундамент | ✅ |
| 3.1 | Спринт 1: ИИ-менеджер — анализ | ⬜ |
| 3.2 | Спринт 2: ИИ-менеджер — утверждение | ⬜ |
| 3.3 | Спринт 3: ИИ-сотрудники | ⬜ |
| 🚀 | Деплой MVP | ⬜ |
| 3.4-3.13 | Спринты 4-13 (пост-MVP) | ⬜ |
| I | Индустриализация | ⬜ |
| F | Финальное тестирование | ⬜ |
| D | Деплой и передача | ⬜ |

## Результаты Спринта 0

### Что реализовано:
- ✅ NextAuth v5: Credentials provider (email/пароль с bcryptjs) + Google OAuth
- ✅ API-роут `/api/auth/[...nextauth]`
- ✅ Middleware: защита `/dashboard/*`, редирект с `/login`, `/register` (без `/onboarding`)
- ✅ Server actions: registerAction, loginAction, logoutAction, googleSignInAction
- ✅ Авто-логин после регистрации (registerAction → signIn → /onboarding)
- ✅ Валидация форм через Zod v4
- ✅ SessionProvider в корневом layout
- ✅ Header с аватаром пользователя и кнопкой «Выйти»
- ✅ Онбординг: сохранение ответов → создание Tenant + Project + Task
- ✅ Канбан-доска: 6 колонок, drag-and-drop через @hello-pangea/dnd
- ✅ Server actions: getTasks, createTask, updateTaskStatus, deleteTask, getProjects
- ✅ Логирование смены статуса задачи (TaskLog)
- ✅ Счётчики задач в колонках и проектах
- ✅ Prisma 7 с @prisma/adapter-libsql для SQLite

### Перенесено в другие спринты:
- US-009 (сброс пароля) → Спринт 8
- US-038 (комментарии к задаче) → Спринт 1
- Тесты (unit, integration, e2e, security) → Спринты 1-3

### Не реализовано (ожидает):
- ⬜ Форма создания задачи (сейчас placeholder-ссылка)
- ⬜ Детальная страница задачи с реальными данными из БД
- ⬜ Интеграция Google OAuth (нужны client_id/secret)
