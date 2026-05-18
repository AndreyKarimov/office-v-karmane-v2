import { test, expect } from "@playwright/test";

test.describe("Sprint 2: Task lifecycle", () => {
  test("task detail page shows assignee dropdown", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "test123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    const taskLink = page.locator('a[href^="/tasks/"]');
    if ((await taskLink.count()) > 0) {
      await taskLink.first().click();
      await page.waitForURL(/\/tasks\//);
      await expect(page.locator("text=Ответственный")).toBeVisible({ timeout: 10000 });
    }
  });

  test("task page shows all lifecycle statuses", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "test123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    await expect(page.locator("text=Бэклог")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=На анализе")).toBeVisible();
    await expect(page.locator("text=На утверждении")).toBeVisible();
    await expect(page.locator("text=В работе")).toBeVisible();
    await expect(page.locator("text=На приёмке")).toBeVisible();
    await expect(page.locator("text=Закрыто")).toBeVisible();
  });

  test("regression: Sprint 0 login flow still works", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Вход")).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("regression: Sprint 1 new task form still works", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "test123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    await page.click('a[href="/new-task"]');
    await page.waitForURL(/\/new-task/);
    await expect(page.locator("text=Создание задачи")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Sprint 3: AI Coworkers", () => {
  test("team page loads and shows hire button", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "test123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    await page.goto("/team");
    await expect(page.locator("text=Моя команда")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Нанять сотрудника")).toBeVisible();
  });

  test("hire form loads", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "test123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    await page.goto("/team/hire");
    await expect(page.locator("text=Нанять ИИ-сотрудника")).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[id="имя-сотрудника"]')).toBeVisible();
    await expect(page.locator('input[id="роль"]')).toBeVisible();
    await expect(page.locator('input[id="навыки-через-запятую"]')).toBeVisible();
  });

  test("regression: Sprint 0 dashboard still works", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "test123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    await expect(page.locator("text=Проекты")).toBeVisible({ timeout: 10000 });
  });

  test("regression: Sprint 1 task detail still works", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "test123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    const taskLink = page.locator('a[href^="/tasks/"]');
    if ((await taskLink.count()) > 0) {
      await taskLink.first().click();
      await page.waitForURL(/\/tasks\//);
      await expect(page.locator("text=Детали")).toBeVisible({ timeout: 10000 });
    }
  });
});
