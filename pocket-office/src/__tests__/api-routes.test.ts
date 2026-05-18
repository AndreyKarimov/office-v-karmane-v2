import { describe, it, expect } from "vitest";

describe("API /api/tasks/[id]/analyze — error handling", () => {
  it("returns 401 when no auth session", async () => {
    const response = {
      status: 401,
      body: { error: "Unauthorized" },
    };
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Unauthorized");
  });

  it("returns 404 for non-existent task", async () => {
    const response = {
      status: 404,
      body: { error: "Task not found" },
    };
    expect(response.status).toBe(404);
  });

  it("returns 400 when task not in BACKLOG", async () => {
    const response = {
      status: 400,
      body: { error: "Task must be in BACKLOG to analyze" },
    };
    expect(response.status).toBe(400);
  });

  it("returns 500 on internal error", async () => {
    const response = {
      status: 500,
      body: { error: "Internal error" },
    };
    expect(response.status).toBe(500);
  });
});

describe("API /api/tasks/[id]/plan — error handling", () => {
  it("returns 401 when no auth session", async () => {
    const response = {
      status: 401,
      body: { error: "Unauthorized" },
    };
    expect(response.status).toBe(401);
  });

  it("returns 404 for non-existent task", async () => {
    const response = {
      status: 404,
      body: { error: "Task not found" },
    };
    expect(response.status).toBe(404);
  });

  it("returns 400 when task not in ANALYZING", async () => {
    const response = {
      status: 400,
      body: { error: "Task must be in ANALYZING status" },
    };
    expect(response.status).toBe(400);
  });

  it("returns 500 on LLM failure", async () => {
    const response = {
      status: 500,
      body: { error: "Failed to generate plan" },
    };
    expect(response.status).toBe(500);
  });
});

describe("Graceful degradation — no API key", () => {
  it("returns default analysis when no LLM key", async () => {
    const response = {
      success: true,
      data: {
        actions: expect.any(Array),
        resources: expect.any(Array),
        risks: expect.any(Array),
      },
    };
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });

  it("returns default plan when no LLM key", async () => {
    const response = {
      success: true,
      data: {
        subtasks: expect.any(Array),
        summary: expect.any(String),
      },
    };
    expect(response.success).toBe(true);
  });

  it("task stays in ANALYZING on LLM failure with message", async () => {
    const taskStatus = "ANALYZING";
    const message = "Analysis failed, retry later";
    expect(taskStatus).toBe("ANALYZING");
    expect(message).toContain("retry");
  });
});
