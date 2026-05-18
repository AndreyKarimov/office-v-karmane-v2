# .vibe/context_summary.md

## Дата обновления: 19.05.2026

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

**Спринты 1–3 выполнены. MVP готов к деплою.**

### Работает:
- Регистрация → авто-логин → онбординг → демо-проект с задачей
- Вход (email/пароль), выход
- Канбан-доска: 6 колонок, drag-and-drop (TaskLog), счётчики
- Создание задачи → авто-анализ ИИ-менеджером (fallback без API-ключа)
- Уточняющие вопросы (до 3 циклов) → генерация плана → утверждение
- Подзадачи с прогресс-баром и % выполнения
- Смена ответственного (люди + ИИ-сотрудники)
- Приёмка задачи (REVIEW → CLOSED / отклонить)
- Комментарии к задаче
- Найм ИИ-сотрудников через опросник
- Экран «Моя команда» с реальными данными
- Очередь подзадач (FIFO + приоритет)
- Цикл выполнения подзадачи (TODO → IN_PROGRESS → DONE)
- Создание проектов
- Middleware: защита /dashboard, /tasks, /new-task, /team, /audit, /billing
- 7 API-роутов, 69 unit-тестов, сборка и линтер чисты

### Ожидает:
- Google OAuth (нужны ключи)
- Валидация drag-and-drop через Draggable (сейчас только Droppable)

### Важные нюансы для следующей сессии:
- Prisma 7: @prisma/adapter-libsql. БЕЗ адаптера PrismaClient не создастся
- NextAuth v5 beta: импорты из `next-auth`, не `@auth/core`
- Middleware deprecation warning — в Next.js 16 вместо middleware.ts нужно proxy.ts
- Zod v4: `parsed.error.issues` (не `.errors`)
- Регистрация: registerAction → signIn("credentials") → /onboarding
- `signIn` из `next-auth/react` (клиент), `auth()` из `@/lib/auth` (сервер)
- LLM Provider: graceful degradation без API-ключа
- URL без `/dashboard`-префикса: `/new-task`, `/tasks/[id]`, `/team`, `/team/hire`
- Все server actions в файлах с `"use server"` должны быть ТОЛЬКО async-функциями

**Следующий этап:** Спринт 4 — ИИ-контроллер и эскалация. Или деплой MVP (см. IMPLEMENTATION_PLAN.md).
