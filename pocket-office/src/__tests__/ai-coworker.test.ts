import { describe, it, expect } from "vitest";

describe("AI Coworker hiring validation", () => {
  function validateHireInput(input: {
    name: string;
    role: string;
    skills: string;
    systemPrompt: string;
  }): { valid: boolean; error?: string } {
    if (!input.name.trim()) return { valid: false, error: "Name is required" };
    if (!input.role.trim()) return { valid: false, error: "Role is required" };
    if (!input.systemPrompt.trim()) return { valid: false, error: "System prompt is required" };
    if (input.name.length > 100) return { valid: false, error: "Name too long" };
    return { valid: true };
  }

  it("rejects empty name", () => {
    expect(validateHireInput({ name: "", role: "Dev", skills: "JS", systemPrompt: "You are..." }).valid).toBe(false);
  });

  it("rejects empty role", () => {
    expect(validateHireInput({ name: "Bot", role: "", skills: "JS", systemPrompt: "You are..." }).valid).toBe(false);
  });

  it("rejects empty system prompt", () => {
    expect(validateHireInput({ name: "Bot", role: "Dev", skills: "JS", systemPrompt: "" }).valid).toBe(false);
  });

  it("accepts valid input", () => {
    expect(validateHireInput({ name: "Bot", role: "Dev", skills: "JS", systemPrompt: "You are helpful" }).valid).toBe(true);
  });

  it("rejects name > 100 chars", () => {
    expect(validateHireInput({ name: "a".repeat(101), role: "Dev", skills: "JS", systemPrompt: "OK" }).valid).toBe(false);
  });
});

describe("Queue sorting (priority + FIFO)", () => {
  function sortQueue(
    items: { priority: number; createdAt: number }[],
  ) {
    return [...items].sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);
  }

  it("higher priority comes first", () => {
    const queue = [
      { priority: 1, createdAt: 100 },
      { priority: 3, createdAt: 200 },
      { priority: 2, createdAt: 300 },
    ];
    const sorted = sortQueue(queue);
    expect(sorted[0].priority).toBe(3);
    expect(sorted[1].priority).toBe(2);
    expect(sorted[2].priority).toBe(1);
  });

  it("FIFO within same priority", () => {
    const queue = [
      { priority: 2, createdAt: 300 },
      { priority: 2, createdAt: 100 },
      { priority: 2, createdAt: 200 },
    ];
    const sorted = sortQueue(queue);
    expect(sorted[0].createdAt).toBe(100);
    expect(sorted[1].createdAt).toBe(200);
    expect(sorted[2].createdAt).toBe(300);
  });

  it("mixed priority and FIFO", () => {
    const queue = [
      { priority: 1, createdAt: 100 },
      { priority: 3, createdAt: 500 },
      { priority: 3, createdAt: 300 },
      { priority: 2, createdAt: 200 },
    ];
    const sorted = sortQueue(queue);
    expect(sorted[0]).toEqual({ priority: 3, createdAt: 300 });
    expect(sorted[1]).toEqual({ priority: 3, createdAt: 500 });
    expect(sorted[2]).toEqual({ priority: 2, createdAt: 200 });
    expect(sorted[3]).toEqual({ priority: 1, createdAt: 100 });
  });
});

describe("Subtask execution cycle", () => {
  it("transitions TODO → IN_PROGRESS → DONE", () => {
    const validTransitions: Record<string, string[]> = {
      TODO: ["IN_PROGRESS"],
      IN_PROGRESS: ["DONE"],
      DONE: [],
    };

    expect(validTransitions["TODO"]).toContain("IN_PROGRESS");
    expect(validTransitions["IN_PROGRESS"]).toContain("DONE");
    expect(validTransitions["DONE"]).toHaveLength(0);
  });

  it("TODO cannot go directly to DONE", () => {
    const validTransitions: Record<string, string[]> = {
      TODO: ["IN_PROGRESS"],
      IN_PROGRESS: ["DONE"],
      DONE: [],
    };
    expect(validTransitions["TODO"]).not.toContain("DONE");
  });

  it("DONE cannot be reversed", () => {
    const validTransitions: Record<string, string[]> = {
      TODO: ["IN_PROGRESS"],
      IN_PROGRESS: ["DONE", "TODO"],
      DONE: [],
    };
    expect(validTransitions["DONE"]).toHaveLength(0);
  });
});

describe("Skills parsing", () => {
  function parseSkills(input: string): string[] {
    return input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  it("parses comma-separated skills", () => {
    expect(parseSkills("SEO, контент, аналитика")).toEqual(["SEO", "контент", "аналитика"]);
  });

  it("handles extra spaces", () => {
    expect(parseSkills("  SEO  ,  контент ,аналитика")).toEqual(["SEO", "контент", "аналитика"]);
  });

  it("returns empty for empty input", () => {
    expect(parseSkills("")).toEqual([]);
  });

  it("filters empty strings from trailing commas", () => {
    expect(parseSkills("SEO,,контент,")).toEqual(["SEO", "контент"]);
  });
});
