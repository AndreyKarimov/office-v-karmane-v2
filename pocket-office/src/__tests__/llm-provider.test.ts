import { describe, it, expect } from "vitest";

function getDefaultAnalysis(description: string) {
  const keywords = description
    .split(/[.,;!?\n]+/)
    .filter((s) => s.trim().length > 3)
    .map((s) => s.trim());

  return {
    actions:
      keywords.length > 0
        ? keywords.slice(0, 5)
        : ["Анализ задачи", "Планирование", "Выполнение"],
    resources: ["Доступ к необходимым системам", "Время на выполнение"],
    risks: ["Недостаток контекста", "Возможны уточнения"],
    dependencies: [],
    needsClarification: false,
    clarificationQuestions: [],
  };
}

function getDefaultPlan(title: string) {
  return {
    subtasks: [
      {
        title: "Анализ и сбор требований",
        description:
          "Собрать и проанализировать все требования по задаче",
        assigneeRole: "Analyst",
        estimatedHours: 4,
        dependencies: [],
      },
      {
        title: "Разработка решения",
        description: "Выполнить основную работу по задаче",
        assigneeRole: "Developer",
        estimatedHours: 8,
        dependencies: ["Анализ и сбор требований"],
      },
      {
        title: "Проверка результата",
        description:
          "Проверить качество выполнения и соответствие требованиям",
        assigneeRole: "Manager",
        estimatedHours: 2,
        dependencies: ["Разработка решения"],
      },
    ],
    summary: `План выполнения задачи: "${title}". 3 этапа от анализа до проверки.`,
  };
}

describe("getDefaultAnalysis — fallback analysis", () => {
  it("extracts keywords from description", () => {
    const result = getDefaultAnalysis(
      "Подготовить отчёт по продажам, собрать данные за Q1.",
    );
    expect(result.actions.length).toBeGreaterThan(0);
    expect(result.actions).toContain("Подготовить отчёт по продажам");
  });

  it("returns default actions for short descriptions", () => {
    const result = getDefaultAnalysis("ab");
    expect(result.actions).toEqual([
      "Анализ задачи",
      "Планирование",
      "Выполнение",
    ]);
  });

  it("always returns resources and risks", () => {
    const result = getDefaultAnalysis("Do something");
    expect(result.resources.length).toBeGreaterThan(0);
    expect(result.risks.length).toBeGreaterThan(0);
  });

  it("does not set needsClarification for fallback", () => {
    const result = getDefaultAnalysis("Any text");
    expect(result.needsClarification).toBe(false);
    expect(result.clarificationQuestions).toEqual([]);
  });

  it("limits keywords to 5", () => {
    const result = getDefaultAnalysis(
      "a b c d e f g h i j k l m n o p".replace(/ /g, ", "),
    );
    expect(result.actions.length).toBeLessThanOrEqual(5);
  });
});

describe("getDefaultPlan — fallback plan", () => {
  it("generates 3 subtasks by default", () => {
    const result = getDefaultPlan("Test Task", "Test description");
    expect(result.subtasks.length).toBe(3);
  });

  it("includes task title in summary", () => {
    const result = getDefaultPlan("Моя задача", "");
    expect(result.summary).toContain("Моя задача");
  });

  it("subtasks have dependencies", () => {
    const result = getDefaultPlan("Test", "");
    const devTask = result.subtasks.find(
      (s) => s.assigneeRole === "Developer",
    );
    expect(devTask?.dependencies).toContain("Анализ и сбор требований");
  });

  it("all subtasks have estimated hours > 0", () => {
    const result = getDefaultPlan("Test", "");
    result.subtasks.forEach((st) => {
      expect(st.estimatedHours).toBeGreaterThan(0);
    });
  });

  it("subtasks have realistic hours (1-40)", () => {
    const result = getDefaultPlan("Test", "");
    result.subtasks.forEach((st) => {
      expect(st.estimatedHours).toBeGreaterThanOrEqual(1);
      expect(st.estimatedHours).toBeLessThanOrEqual(40);
    });
  });
});

describe("3-cycle clarification logic", () => {
  function canAskMore(cycle: number, maxCycles = 3): boolean {
    return cycle < maxCycles;
  }

  it("allows up to 3 cycles", () => {
    expect(canAskMore(0)).toBe(true);
    expect(canAskMore(1)).toBe(true);
    expect(canAskMore(2)).toBe(true);
    expect(canAskMore(3)).toBe(false);
  });

  it("stops at cycle 3", () => {
    const cycles = [0, 1, 2];
    const results = cycles.map((c) => canAskMore(c));
    expect(results).toEqual([true, true, true]);

    expect(canAskMore(3)).toBe(false);
    expect(canAskMore(4)).toBe(false);
  });

  it("default maxCycles is 3", () => {
    expect(canAskMore(2)).toBe(true);
    expect(canAskMore(2, 3)).toBe(true);
    expect(canAskMore(3, 3)).toBe(false);
  });
});
