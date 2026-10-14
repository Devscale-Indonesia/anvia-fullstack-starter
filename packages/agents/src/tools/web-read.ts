import { createTool } from "@anvia/core";
import { tavily } from "@tavily/core";
import { z } from "zod";

export interface WebReadToolOptions {
  apiKey?: string;
  maxChars?: number;
}

export function createWebReadTool(options: WebReadToolOptions = {}) {
  const client = tavily({ apiKey: options.apiKey ?? process.env.TAVILY_API_KEY });
  const maxChars = options.maxChars ?? 20000;

  return createTool({
    name: "web_read",
    description:
      "Fetch a web page and return its content as markdown. Use after web_search when a result needs to be read in full.",
    inputSchema: z.object({
      url: z.url().describe("Full URL of the page to read"),
      format: z.enum(["markdown", "text"]).default("markdown"),
    }),
    async execute({ url, format }) {
      const response = await client.extract([url], { format });

      const failed = response.failedResults[0];
      if (failed) throw new Error(`Failed to read ${failed.url}: ${failed.error}`);

      const page = response.results[0];
      if (!page) throw new Error(`No content returned for ${url}`);

      return {
        url: page.url ?? url,
        title: page.title ?? null,
        content: (page.rawContent ?? "").slice(0, maxChars),
        truncated: (page.rawContent ?? "").length > maxChars,
      };
    },
  });
}
