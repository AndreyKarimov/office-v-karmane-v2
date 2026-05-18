# ARCHITECTURE.md — «Офис в кармане»

## Стек технологий

| Слой | Технология | Назначение |
|------|-----------|------------|
| Фреймворк | Next.js 15 (App Router) | Серверный рендеринг, API-роуты, маршрутизация |
| Язык | TypeScript 5 (strict) | Типизация всего кода |
| Стили | Tailwind CSS 4 | Utility-first CSS |
| ORM | Prisma 6 | Работа с БД, миграции |
| БД (dev) | SQLite | Локальная разработка |
| БД (prod) | PostgreSQL (Supabase) | Продакшен |
| Аутентификация | NextAuth.js v5 | Email/Google/Telegram OAuth, JWT |
| LLM | OpenRouter API → `openrouter/free` | ИИ-менеджер и ИИ-сотрудники |
| LLM-клиент | OpenAI SDK (кастомный baseURL) | OpenAI-совместимый API OpenRouter |
| DnD | @hello-pangea/dnd | Drag-and-drop на канбан-доске |
| Валидация | zod | Валидация форм и API |
| Тестирование | Vitest + Playwright | Юнит/E2E |
| Деплой | Vercel (Hobby) | Хостинг Next.js |

## Схема компонентов

```
┌─────────────────────────────────────────────────────┐
│                    Браузер (Next.js)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │  Login   │ │ Онбординг │ │ Канбан   │ │ Команда │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / Server Actions
┌──────────────────────▼──────────────────────────────┐
│               Next.js App Router (Server)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ NextAuth │ │ API Routes│ │   Prisma Client      │ │
│  │  (JWT)   │ │ /api/*    │ │                      │ │
│  └──────────┘ └────┬─────┘ └──────────┬───────────┘ │
│                    │                   │              │
│  ┌─────────────────▼───────────────────▼──────────┐  │
│  │              LLM Provider Adapter              │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐  │  │
│  │  │ OpenRouter │ │ YandexGPT  │ │  GigaChat   │  │  │
│  │  │ (сейчас)   │ │ (будущее)  │ │ (будущее)   │  │  │
│  │  └────────────┘ └────────────┘ └────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                     Данные                           │
│  ┌──────────┐              ┌──────────────────────┐ │
│  │  SQLite  │    (dev)     │  Supabase PostgreSQL │ │
│  │ file:.db │              │      (prod)          │ │
│  └──────────┘              └──────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## LLM Provider Adapter

Абстрактный слой для переключения между LLM-провайдерами:

```
interface LLMProvider {
  chat(messages: Message[]): Promise<LLMResponse>;
  stream(messages: Message[]): AsyncIterable<LLMChunk>;
}

class OpenRouterProvider implements LLMProvider { ... }  // ← текущий
class YandexGPTProvider implements LLMProvider { ... }   // будущее
class GigaChatProvider implements LLMProvider { ... }    // будущее
```

**Текущая реализация:** OpenAI SDK с `baseURL: https://openrouter.ai/api/v1`, модель `openrouter/free` (роутер бесплатных моделей).

**Конфигурация** (из `.env.local`):
- `OPENROUTER_API_KEY` — ключ API
- `OPENROUTER_BASE_URL` — `https://openrouter.ai/api/v1`
- `OPENROUTER_MODEL` — `openrouter/free`

## Модель данных (Prisma)

```
User ──┬── TenantMember ── Tenant
       │       │
       │   (роль: Admin | Member | Viewer)
       │
       ├── AICoworker (ИИ-сотрудник)
       │
       └── Task (задачи, назначенные пользователю)

Tenant ── Project ── Task ── Subtask
                        │
                        ├── Comment
                        ├── TaskLog (история статусов)
                        └── Attachment

AICoworker ── Subtask (очередь выполнения)

AuditLog (append-only, tenant_id)
```

## Статусы задач

```
Бэклог → На анализе → На утверждении → В работе → На приёмке → Закрыто
```

Переходы строгие, без пропусков (кроме ручного создания сразу в «Бэклог»).

## Структура проекта

```
pocket-office/
├── src/
│   ├── app/                    # App Router
│   │   ├── (auth)/            # /login, /register, /onboarding
│   │   ├── (dashboard)/       # /dashboard, /tasks/[id], /team
│   │   └── api/               # API Routes
│   ├── components/            # React-компоненты
│   │   ├── ui/               # Базовые UI (кнопки, инпуты)
│   │   ├── kanban/           # Канбан-доска, колонки, карточки
│   │   ├── tasks/            # Карточка задачи, план
│   │   └── team/             # Карточки ИИ-сотрудников
│   ├── lib/                   # Утилиты
│   │   ├── llm/              # Provider Adapter
│   │   ├── auth/             # NextAuth конфигурация
│   │   └── db/               # Prisma client
│   └── types/                # TypeScript-типы
├── prisma/
│   └── schema.prisma         # Схема БД
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.local                # Секреты (не в гите)
├── .env.example              # Шаблон переменных
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## Зависимости

| Пакет | Версия | Назначение |
|-------|--------|------------|
| next | ^15 | Фреймворк |
| react / react-dom | ^19 | UI |
| typescript | ^5 | Язык |
| tailwindcss | ^4 | Стили |
| prisma / @prisma/client | ^6 | ORM |
| next-auth | ^5 beta | Аутентификация |
| @auth/prisma-adapter | ^2 | NextAuth + Prisma |
| openai | ^4 | OpenAI SDK (для OpenRouter) |
| @hello-pangea/dnd | ^17 | Drag-and-drop |
| zod | ^3 | Валидация |
| vitest | ^3 | Unit-тесты |
| @playwright/test | ^1 | E2E-тесты |
