<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: Офис в кармане (pocket-office)

## Workflow
- Всегда читай `SESSION_MANIFEST.md` и `IMPLEMENTATION_PLAN.md` при старте
- После реализации: `npm run build` → `npm run lint` → `npm test` → коммит → пуш
- Коммит и пуш — **обязательные** финальные шаги каждого спринта
- Не останавливайся, пока не выполнен пуш (кроме случаев сетевых ограничений)

## Commands (из рабочей директории pocket-office)
- `npm run dev` — dev-сервер
- `npm run build` — сборка
- `npm run lint` — ESLint
- `npm test` — Vitest unit-тесты
- `npm run test:e2e` — Playwright E2E тесты
- `npx prisma migrate dev` — миграции БД

## Key rules
- Prisma 7: используется `@prisma/adapter-libsql`, PrismaClient генерируется в `src/generated/prisma/`
- NextAuth v5 beta: импорты из `next-auth`, не `@auth/core`
- Zod v4: `parsed.error.issues`, не `.errors`
- Server Actions помечаются `"use server"`, все экспорты должны быть async
- LLM Provider: graceful degradation без API-ключа (fallback-планы)
- Ответы всегда на русском
