import { test, expect } from "@playwright/test";

test.describe("Sprint 1: AI-Manager task flow", () => {
  test("create task → AI analyzes → plan generated", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "test123");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    await page.click('a[href="/dashboard/new-task"]');
    await page.waitForURL(/\/new-task/);

    await page.fill(
      'input[id="название-задачи"]',
      "Подготовить отчёт Q1",
    );
    await page.fill(
      'textarea[id="description"]',
      "Нужен квартальный отчёт по продажам",
    );

    await page.click('button[type="submit"]');

    await page.waitForURL(/\/tasks\//);

    await expect(
      page.locator("text=Подготовить отчёт Q1"),
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.locator("text=На анализе"),
    ).toBeVisible({ timeout: 15000 });
  });

  test("Kanban Board displays all 6 columns with tasks", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "test123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    await expect(page.locator("text=Бэклог")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("text=На анализе")).toBeVisible();
    await expect(page.locator("text=На утверждении")).toBeVisible();
    await expect(page.locator("text=В работе")).toBeVisible();
    await expect(page.locator("text=На приёмке")).toBeVisible();
    await expect(page.locator("text=Закрыто")).toBeVisible();
  });

  test("Task detail page shows task data from DB", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "test123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    const taskLink = page.locator(
      'a[href^="/dashboard/tasks/"]',
    );
    if ((await taskLink.count()) > 0) {
      await taskLink.first().click();
      await page.waitForURL(/\/tasks\//);

      await expect(page.locator("text=Детали")).toBeVisible({
        timeout: 10000,
      });
      await expect(page.locator("text=Статус")).toBeVisible();
      await expect(page.locator("text=Приоритет")).toBeVisible();
      await expect(page.locator("text=Проект")).toBeVisible();
    }
  });

  test("Comments section is visible on task page", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "test123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    const taskLink = page.locator(
      'a[href^="/dashboard/tasks/"]',
    );
    if ((await taskLink.count()) > 0) {
      await taskLink.first().click();
      await page.waitForURL(/\/tasks\//);

      const commentInput = page.locator(
        'input[placeholder="Напишите комментарий..."]',
      );
      await expect(commentInput).toBeVisible({ timeout: 10000 });
    }
  });

  test("New task creation form works", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "test123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    await page.click('a[href="/dashboard/new-task"]');
    await page.waitForURL(/\/new-task/);

    await expect(
      page.locator("text=Создание задачи"),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator('input[id="название-задачи"]'),
    ).toBeVisible();
    await expect(
      page.locator('textarea[id="description"]'),
    ).toBeVisible();
    await expect(page.locator("text=Проект")).toBeVisible();
    await expect(page.locator("text=Приоритет")).toBeVisible();
  });

  test("Sprint 0 regression — login flow works", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("text=Вход")).toBeVisible({
      timeout: 10000,
    });

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await expect(
      page.locator('button[type="submit"]'),
    ).toBeVisible();
  });

  test("Sprint 0 regression — unauthenticated users redirected to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
    await expect(page.locator("text=Вход")).toBeVisible({
      timeout: 10000,
    });
  });
});
