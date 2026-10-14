import { createTool } from "@anvia/core";
import { tavily } from "@tavily/core";
import { z } from "zod";

export interface WebSearchToolOptions {
  apiKey?: string;
}

export function createWebSearchTool(options: WebSearchToolOptions = {}) {
  const client = tavily({ apiKey: options.apiKey ?? process.env.TAVILY_API_KEY });

  return createTool({
    name: "web_search",
    description:
      "Search the web and return a short answer plus top results (title, url, content). Use for current events or facts you are unsure about.",
    inputSchema: z.object({
      query: z.string().min(1).describe("Search query"),
      maxResults: z.number().int().min(1).max(10).default(5),
      topic: z.enum(["general", "news", "finance"]).default("general"),
    }),
    async execute({ query, maxResults, topic }) {
      const response = await client.search(query, { maxResults, topic });

      return {
        answer: response.answer ?? null,
        results: response.results.map((result) => ({
          title: result.title ?? "",
          url: result.url ?? "",
          content: result.content ?? "",
          score: result.score ?? null,
          publishedDate: result.publishedDate ?? null,
        })),
      };
    },
  });
}
