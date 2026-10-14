import {
  Agent,
  type AgentMemoryOptions,
  type Document,
  type AgentStream,
  type MemoryScope,
  type Message,
} from "@anvia/core";
import { OpenAIClient, type OpenAICompletionModelId } from "@anvia/openai";
import { HR_CONTEXT } from "./context/faq.ts";
import { HR_INSTRUCTION } from "./prompts/instruction.ts";
import { createWebReadTool } from "./tools/web-read.ts";
import { createWebSearchTool } from "./tools/web-search.ts";

export { HR_CONTEXT, HR_FAQ, type FaqEntry } from "./context/faq.ts";
export { HR_INSTRUCTION } from "./prompts/instruction.ts";
export { createWebSearchTool, type WebSearchToolOptions } from "./tools/web-search.ts";
export { createWebReadTool, type WebReadToolOptions } from "./tools/web-read.ts";

export interface RunAgentOptions {
  prompt?: string;
  messages?: readonly Message[];
  apiKey?: string;
  baseUrl?: string;
  modelId?: OpenAICompletionModelId;
  api?: "responses" | "chat";
  id?: string;
  instructions?: string;
  context?: readonly Document[];
  maxTurns?: number;
  memory?: AgentMemoryOptions;
  session?: MemoryScope;
}

export function runAgent(options: RunAgentOptions): AgentStream<string> {
  const apiKey = options.apiKey ?? process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is required");

  const client = new OpenAIClient({
    apiKey,
    baseUrl: options.baseUrl ?? "https://openrouter.ai/api/v1",
  });

  const model = client.completionModel({
    modelId: options.modelId ?? "openai/gpt-6-luna",
    api: options.api ?? "chat",
  });

  const agent = new Agent({
    id: options.id ?? "hr-agent",
    name: "HR Agent",
    description: "Asisten HR untuk kebijakan SDM, cuti, rekrutmen, dan onboarding",
    model,
    instructions: options.instructions ?? HR_INSTRUCTION,
    context: options.context ?? HR_CONTEXT,
    tools: [createWebSearchTool(), createWebReadTool()],
    maxTurns: options.maxTurns ?? 20,
    memory: options.memory,
  });

  if (options.session) {
    if (!options.prompt) throw new Error("session requires prompt");
    return agent.stream({ prompt: options.prompt, session: options.session });
  }
  if (options.messages) return agent.stream({ messages: options.messages });
  if (!options.prompt) throw new Error("prompt or messages is required");
  return agent.stream({ prompt: options.prompt });
}
