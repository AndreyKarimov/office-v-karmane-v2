import OpenAI from "openai";
import { env } from "@/lib/env";

interface LLMResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/\[SYSTEM\]|\[ASSISTANT\]|\[USER\]/gi, "[REDACTED]")
    .replace(/<\|im_start\|>|<\|im_end\|>/gi, "[REDACTED]")
    .replace(/Ignore previous instructions|ignore all instructions|disregard all|forget all/gi, "[REDACTED]")
    .replace(/system:\s*you are now|system:\s*act as|system:\s*pretend/gi, "[REDACTED]")
    .replace(/DAN:\s*|Do Anything Now/gi, "[REDACTED]")
    .slice(0, 8000);
}

function getClient(): OpenAI | null {
  if (!env.OPENROUTER_API_KEY) return null;
  return new OpenAI({
    baseURL: env.OPENROUTER_BASE_URL,
    apiKey: env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": env.NEXTAUTH_URL,
      "X-Title": "Office in Pocket",
    },
    timeout: 25000,
  });
}

export async function chat(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const client = getClient();
  if (!client) throw new Error("LLM not configured");

  const response = await client.chat.completions.create({
    model: env.OPENROUTER_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: sanitizeInput(userMessage) },
    ],
    temperature: 0.3,
    max_tokens: 1500,
  });

  return response.choices[0]?.message?.content || "";
}

async function chatJson(
  systemPrompt: string,
  userMessage: string,
): Promise<LLMResponse> {
  try {
    const raw = await chat(systemPrompt, userMessage);
    const jsonStr = raw.replace(/```json\s*|\s*```/g, "").trim();
    const data = JSON.parse(jsonStr);
    return { success: true, data };
  } catch (err) {
    if (err instanceof SyntaxError) {
      return { success: false, error: "Failed to parse LLM response as JSON" };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "LLM error",
    };
  }
}

export async function analyzeTask(
  title: string,
  description: string,
): Promise<LLMResponse> {
  if (!env.OPENROUTER_API_KEY) {
    return { success: true, data: getDefaultAnalysis(description) };
  }

  try {
    return await chatJson(
      `You are an AI project manager. Analyze the task and return valid JSON only.
{
  "actions": ["string array - key actions required"],
  "resources": ["string array - resources needed"],
  "risks": ["string array - potential risks"],
  "dependencies": ["string array - dependencies on other systems/people"],
  "needsClarification": true/false,
  "clarificationQuestions": ["string array - 1-3 questions if clarification needed, otherwise empty"]
}`,
      `Task title: ${sanitizeInput(title)}\nTask description: ${sanitizeInput(description)}`,
    );
  } catch {
    return { success: true, data: getDefaultAnalysis(description) };
  }
}

function getDefaultAnalysis(description: string) {
  const keywords = description
    .split(/[.,;!?\n]+/)
    .filter((s) => s.trim().length > 3)
    .map((s) => s.trim());

  return {
    actions: keywords.length > 0 ? keywords.slice(0, 5) : ["Анализ задачи", "Планирование", "Выполнение"],
    resources: ["Доступ к необходимым системам", "Время на выполнение"],
    risks: ["Недостаток контекста", "Возможны уточнения"],
    dependencies: [],
    needsClarification: false,
    clarificationQuestions: [],
  };
}

export async function generateClarifyingQuestions(
  title: string,
  description: string,
  previousQa: { question: string; answer: string }[],
  cycle: number,
): Promise<string[]> {
  if (!env.OPENROUTER_API_KEY || cycle >= 3) return [];

  try {
    const qaContext = previousQa
      .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
      .join("\n");

    return await chat(
      `You are an AI project manager. You are in clarification cycle ${cycle + 1} of 3.
Based on the task and previous Q&A, ask 1-2 most important unanswered questions needed to build a good execution plan.
Return ONLY the questions, one per line, without numbering. Maximum 2 questions. Be concise.`,
      `Task: ${sanitizeInput(title)}\nDescription: ${sanitizeInput(description)}\n\nPrevious Q&A:\n${qaContext || "None"}`,
    ).then((r) =>
      r
        .split("\n")
        .map((l) => l.replace(/^\d+[.)\s]+/, "").trim())
        .filter((l) => l.length > 5),
    );
  } catch {
    return [];
  }
}

export interface GeneratedPlan {
  subtasks: {
    title: string;
    description: string;
    assigneeRole: string;
    estimatedHours: number;
    dependencies: string[];
  }[];
  summary: string;
}

export async function generatePlan(
  title: string,
  description: string,
  qaHistory: { question: string; answer: string }[],
): Promise<LLMResponse> {
  if (!env.OPENROUTER_API_KEY) {
    return { success: true, data: getDefaultPlan(title) };
  }

  const qaContext = qaHistory
    .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
    .join("\n");

  try {
    return await chatJson(
      `You are an AI project manager. Generate an execution plan as valid JSON:
{
  "subtasks": [
    {
      "title": "string",
      "description": "string",
      "assigneeRole": "string - role needed (Analyst, Researcher, Writer, Developer, Designer, Manager, Human)",
      "estimatedHours": number,
      "dependencies": ["string array - titles of subtasks this depends on"]
    }
  ],
  "summary": "short overall plan summary"
}
Rules:
- Break task into 3-7 concrete subtasks
- For each subtask, specify the best role
- Mark dependencies between subtasks (use exact subtask titles)
- estimatedHours should be realistic (1-40)
- Keep descriptions under 200 chars each`,
      `Task: ${sanitizeInput(title)}\nDescription: ${sanitizeInput(description)}\n\nClarification Q&A:\n${qaContext || "No clarification needed"}`,
    );
  } catch {
    return { success: true, data: getDefaultPlan(title) };
  }
}

function getDefaultPlan(title: string): GeneratedPlan {
  return {
    subtasks: [
      {
        title: "Анализ и сбор требований",
        description: "Собрать и проанализировать все требования по задаче",
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
        description: "Проверить качество выполнения и соответствие требованиям",
        assigneeRole: "Manager",
        estimatedHours: 2,
        dependencies: ["Разработка решения"],
      },
    ],
    summary: `План выполнения задачи: "${title}". 3 этапа от анализа до проверки.`,
  };
}
