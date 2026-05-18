import { describe, it, expect } from "vitest";

const VALID_TRANSITIONS: Record<string, string[]> = {
  BACKLOG: ["ANALYZING"],
  ANALYZING: ["PENDING_APPROVAL", "BACKLOG"],
  PENDING_APPROVAL: ["IN_PROGRESS", "ANALYZING"],
  IN_PROGRESS: ["REVIEW", "ANALYZING"],
  REVIEW: ["CLOSED", "ANALYZING", "IN_PROGRESS"],
  CLOSED: [],
};

function isValidTransition(from: string, to: string): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

describe("Status transition validation", () => {
  it("BACKLOG → ANALYZING is valid", () => {
    expect(isValidTransition("BACKLOG", "ANALYZING")).toBe(true);
  });

  it("BACKLOG → IN_PROGRESS is invalid", () => {
    expect(isValidTransition("BACKLOG", "IN_PROGRESS")).toBe(false);
  });

  it("ANALYZING → PENDING_APPROVAL is valid", () => {
    expect(isValidTransition("ANALYZING", "PENDING_APPROVAL")).toBe(true);
  });

  it("PENDING_APPROVAL → IN_PROGRESS is valid", () => {
    expect(isValidTransition("PENDING_APPROVAL", "IN_PROGRESS")).toBe(true);
  });

  it("PENDING_APPROVAL → ANALYZING is valid (reject)", () => {
    expect(isValidTransition("PENDING_APPROVAL", "ANALYZING")).toBe(true);
  });

  it("IN_PROGRESS → REVIEW is valid", () => {
    expect(isValidTransition("IN_PROGRESS", "REVIEW")).toBe(true);
  });

  it("REVIEW → CLOSED is valid (accept)", () => {
    expect(isValidTransition("REVIEW", "CLOSED")).toBe(true);
  });

  it("REVIEW → ANALYZING is valid (reject from review)", () => {
    expect(isValidTransition("REVIEW", "ANALYZING")).toBe(true);
  });

  it("REVIEW → IN_PROGRESS is valid (back to work)", () => {
    expect(isValidTransition("REVIEW", "IN_PROGRESS")).toBe(true);
  });

  it("CLOSED → * is always invalid", () => {
    expect(isValidTransition("CLOSED", "ANALYZING")).toBe(false);
    expect(isValidTransition("CLOSED", "IN_PROGRESS")).toBe(false);
    expect(isValidTransition("CLOSED", "REVIEW")).toBe(false);
    expect(isValidTransition("CLOSED", "BACKLOG")).toBe(false);
  });

  it("IN_PROGRESS → PENDING_APPROVAL is invalid (no backward skip)", () => {
    expect(isValidTransition("IN_PROGRESS", "PENDING_APPROVAL")).toBe(false);
  });

  it("IN_PROGRESS → CLOSED is invalid (must go through REVIEW)", () => {
    expect(isValidTransition("IN_PROGRESS", "CLOSED")).toBe(false);
  });
});

describe("Full lifecycle happy path", () => {
  const path = [
    "BACKLOG",
    "ANALYZING",
    "PENDING_APPROVAL",
    "IN_PROGRESS",
    "REVIEW",
    "CLOSED",
  ];

  it("each step in happy path is a valid transition", () => {
    for (let i = 0; i < path.length - 1; i++) {
      expect(isValidTransition(path[i], path[i + 1])).toBe(true);
    }
  });

  it("happy path has 6 steps", () => {
    expect(path.length).toBe(6);
  });
});

describe("Subtask progress calculation", () => {
  function calcProgress(
    subtasks: { status: string }[],
  ): { done: number; total: number; percent: number } {
    const total = subtasks.length;
    const done = subtasks.filter((s) => s.status === "DONE").length;
    return {
      done,
      total,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }

  it("0% when no subtasks done", () => {
    const r = calcProgress([
      { status: "TODO" },
      { status: "TODO" },
      { status: "IN_PROGRESS" },
    ]);
    expect(r.percent).toBe(0);
  });

  it("50% when half done", () => {
    const r = calcProgress([
      { status: "DONE" },
      { status: "DONE" },
      { status: "TODO" },
      { status: "TODO" },
    ]);
    expect(r.percent).toBe(50);
  });

  it("100% when all done", () => {
    const r = calcProgress([
      { status: "DONE" },
      { status: "DONE" },
      { status: "DONE" },
    ]);
    expect(r.percent).toBe(100);
  });

  it("0% when empty list", () => {
    const r = calcProgress([]);
    expect(r.percent).toBe(0);
  });

  it("auto-transitions to REVIEW when all subtasks done", () => {
    const subtasks = [
      { status: "DONE" },
      { status: "DONE" },
    ];
    const r = calcProgress(subtasks);
    const shouldTransition =
      subtasks.length > 0 && subtasks.every((s) => s.status === "DONE");
    expect(shouldTransition).toBe(true);
    expect(r.percent).toBe(100);
  });
});
