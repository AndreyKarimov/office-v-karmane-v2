# .vibe/context_summary.md

## Дата обновления: 18.05.2026

## Продукт

«Офис в кармане» — платформа оркестрации ИИ-команд. Пользователь создаёт задачу, ИИ-менеджер анализирует, задаёт вопросы, генерирует план, утверждает с человеком, распределяет подзадачи между ИИ-сотрудниками. Канбан-доска (6 колонок), контроль качества, аудит.

## Целевая аудитория (MVP)

Соло-предприниматели, CEO SMB (5-50 чел), менеджеры проектов.

## MVP-сценарий

1. Регистрация (email) → авто-логин
2. Онбординг (3 вопроса → демо-проект + задача)
3. Создание задачи на канбан-доске (6 колонок, drag-and-drop)
4. ИИ-менеджер анализирует → уточняющие вопросы → план
5. Пользователь утверждает план
6. Задача проходит статусы: BACKLOG → ANALYZING → PENDING_APPROVAL → IN_PROGRESS → REVIEW → CLOSED

## Технический стек

- **Фреймворк:** Next.js 16 App Router + TypeScript + Tailwind CSS 4
- **БД:** Prisma 7 + SQLite (dev, через @prisma/adapter-libsql + @libsql/client)
- **Аутентификация:** NextAuth.js v5 beta (Credentials — email/пароль, Google OAuth)
- **LLM:** OpenRouter API → `openrouter/free` (через OpenAI SDK + Provider Adapter)
- **Деплой:** Vercel + Supabase
- **Тестирование:** Vitest + Playwright (пока не настроены)

## Дизайн-система

Cognitive Enterprise — Strategic Blue (#003d9b) + Neural Teal (#006b5f) + Inter.
Минимализм + Modern Corporate. 4px grid, карточки с мягкими тенями.

## Ключевые архитектурные решения

- Prisma 7 требует Driver Adapter — используем @prisma/adapter-libsql (@libsql/client)
- PrismaClient генерируется в src/generated/prisma/
- NextAuth v5: JWT-стратегия, PrismaAdapter, pages: { signIn: "/login" }
- Middleware на базе auth() из NextAuth — защищает /dashboard/*
- Server actions (не API routes) для всей бизнес-логики
- Drag-and-drop: @hello-pangea/dnd (замена react-beautiful-dnd)
- Мультитенантность: tenant_id в TenantMember, tenant создаётся при регистрации

## Структура src/lib/

| Файл | Назначение |
|------|-----------|
| `prisma.ts` | Синглтон PrismaClient (libsql adapter) |
| `auth.ts` | NextAuth v5: Credentials + Google, JWT callbacks |
| `auth-actions.ts` | registerAction (создание User+Tenant, возвращает email/password для авто-логина), loginAction, logoutAction, googleSignInAction |
| `task-actions.ts` | getTasks (по tenant), createTask, updateTaskStatus (с TaskLog), deleteTask, getProjects |
| `onboarding-actions.ts` | completeOnboarding (создаёт Project + Task) |
| `env.ts` | Типизированные переменные окружения |

## Структура компонентов

| Директория | Компоненты |
|-----------|-----------|
| `components/ui/` | Button (5 variants), Card, Input, Chip (5 variants), Avatar (initials/image, AI mode) |
| `components/layout/` | Header ("use client": session + logout), Sidebar ("use client": usePathname), MobileNav |
| `components/kanban/` | KanbanBoard (DragDropContext), KanbanColumn (Droppable), KanbanCard (Draggable) |
| `components/providers/` | SessionProvider (обёртка next-auth/react) |

## Текущий статус

**Спринт 0 (Фундамент) выполнен.**

### Работает:
- Регистрация → авто-логин → онбординг → демо-проект с задачей
- Вход (email/пароль)
- Выход (из Header)
- Dashboard: канбан-доска с задачами из БД
- Drag-and-drop задач между колонками (с записью в TaskLog)
- Проекты в левом сайдбаре (из БД)
- Защита /dashboard/* через middleware
- Редирект авторизованных с /login, /register на /dashboard
- Сборка и TypeScript чисты

### Перенесено в другие спринты:
- US-009 (сброс пароля) → Спринт 8
- US-038 (комментарии) → Спринт 1
- Тесты → Спринты 1-3

### Ожидает:
- Форма создания задачи (пока заглушка)
- Детальная страница задачи с реальными данными
- Google OAuth (нужны ключи)
- LLM Provider Adapter
- ИИ-менеджер (анализ, вопросы, план)

### Важные нюансы для следующей сессии:
- Prisma 7 использует driver adapter (@prisma/adapter-libsql). БЕЗ адаптера PrismaClient не создастся.
- NextAuth v5 beta — импорты из `next-auth` (не `@auth/core`).
- Middleware deprecation warning — в Next.js 16 вместо middleware.ts нужно proxy.ts. Пока работает.
- Zod v4: `parsed.error.issues` (не `.errors`).
- Регистрация: registerAction возвращает email/password → клиент вызывает signIn("credentials") → редирект на /onboarding. Без этого шага сессия не создаётся.
- `signIn` из `next-auth/react` (клиент), `auth()` из `@/lib/auth` (сервер).

**Следующий этап:** Спринт 1 — ИИ-менеджер (анализ задачи и генерация плана). Ключевые файлы для старта: `src/lib/task-actions.ts`, `src/components/kanban/KanbanBoard.tsx`, `src/app/(dashboard)/tasks/[id]/page.tsx`.
