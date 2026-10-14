# Anvia Monorepo

Starter repo for **Devscale Indonesia — AI Product Engineering, Batch II**.

It gives you three pieces that are ready but **not yet connected**: an HR agent, a backend API, and a frontend web app. During the program you will wire them together: the web app sends a question, the API runs the agent, and the answer streams back to the browser. Anvia Lens runs alongside so you can see what the agent is doing.

## Tech stack

| Part              | Tools                                                   |
| ----------------- | ------------------------------------------------------- |
| Monorepo          | pnpm workspaces                                         |
| `apps/api`        | Hono, Zod, `@hono/zod-validator`                        |
| `apps/web`        | React, Vite, Tailwind CSS, TanStack Router              |
| `packages/agents` | `@anvia/core`, `@anvia/openai` (via OpenRouter), Tavily |
| `infra/lens`      | Anvia Lens (agent observability) on Docker Compose      |
| Code quality      | TypeScript, oxlint, oxfmt                               |

## Project structure

```
anvia-monorepo/
├── apps/
│   ├── api/                  Backend (Hono) — http://localhost:3000
│   └── web/                  Frontend (React + Vite) — http://localhost:5173
├── packages/
│   └── agents/               HR agent + evals
│       └── src/
│           ├── index.ts          runAgent()
│           ├── prompts/          system prompt
│           ├── tools/            web_search, web_read (Tavily)
│           ├── context/          static FAQ the agent answers from
│           └── evals/            eval suites
├── infra/
│   └── lens/                 Anvia Lens docker-compose + its own .env
├── .env.example              API keys for the agent
└── package.json              root scripts
```

## Prerequisites

- Node.js 22 or newer
- pnpm (`npm i -g pnpm`)
- Docker (only needed for Lens)
- API keys: [OpenRouter](https://openrouter.ai) for the model and [Tavily](https://tavily.com) for web search

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Add your API keys
cp .env.example .env
# then fill in OPENROUTER_API_KEY and TAVILY_API_KEY

# 3. Run the API and web app together
pnpm dev
```

- API: http://localhost:3000
- Web: http://localhost:5173

## The agent (`packages/agents`)

`runAgent()` creates an HR assistant that answers in Bahasa Indonesia. It can:

- answer company policy questions from the static FAQ in `src/context/faq.ts`
- search and read the web for labor law questions (`web_search`, `web_read`)
- refer sensitive topics (salary, discipline, layoffs) to the HR team

```ts
import { runAgent } from "@anvia/agents";

const stream = runAgent({ prompt: "Kapan gajian?" });
console.log(await stream.text);
```

Edit `src/context/faq.ts` to change what the agent knows about the company, and `src/prompts/instruction.ts` to change how it behaves.

### Evals

Evals check whether the agent's answers are good. Each case has an `input` and an `expected` description. An LLM judge then scores the agent's answer against that description.

| Suite              | What it checks                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `eval-hukum.ts`    | Labor law facts (annual leave, THR, maternity leave)                                           |
| `eval-faq.ts`      | Answers match the FAQ, and nothing is made up when the FAQ has no answer                       |
| `eval-perilaku.ts` | Behavior: replies in Bahasa Indonesia, protects salary data, asks when the question is unclear |

```bash
pnpm --filter @anvia/agents eval            # all suites
pnpm --filter @anvia/agents eval:faq        # one suite
```

Evals call real models, so they need the keys in the root `.env`.

## Anvia Lens (observability)

Lens shows traces of every agent run: prompts, tool calls, timing, and token usage.

```bash
cp infra/lens/.env.example infra/lens/.env
# fill each secret with a random value: openssl rand -hex 32

pnpm lens:up      # start
pnpm lens:logs    # follow logs
pnpm lens:down    # stop (data is kept)
```

Then open http://localhost:

1. Create an account. The first account becomes the workspace owner.
2. Create a project.
3. Open **Connect** and create an ingestion key. Copy the secret key right away, because it is shown only once.

Docs: https://docs.anvia.dev/lens/

## Scripts

Run these from the repo root.

| Command                                    | What it does              |
| ------------------------------------------ | ------------------------- |
| `pnpm dev`                                 | Run every app in dev mode |
| `pnpm build`                               | Build every app           |
| `pnpm typecheck`                           | Type-check every package  |
| `pnpm lint` / `pnpm lint:fix`              | Lint with oxlint          |
| `pnpm format` / `pnpm format:check`        | Format with oxfmt         |
| `pnpm lens:up` / `lens:down` / `lens:logs` | Manage the Lens stack     |

## What to build next

1. **API → agent:** add a chat route in `apps/api` that validates the request with Zod and calls `runAgent()`.
2. **Stream the answer:** send the agent's output back from the API as a stream.
3. **Web → API:** build a chat page in `apps/web` that sends messages and renders the streamed reply.
4. **Observability:** connect the agent to Lens with `@anvia/lens` and watch the traces.
5. **Evals:** add cases whenever you change the prompt or FAQ, and run the evals before you ship.
