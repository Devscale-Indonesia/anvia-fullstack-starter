import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono();

app.get("/", (c) => c.json({ name: "@anvia/api", status: "ok" }));

const echoSchema = z.object({
  message: z.string().min(1),
});

app.post("/echo", zValidator("json", echoSchema), (c) => {
  const body = c.req.valid("json");
  return c.json({ echo: body.message });
});

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API running at http://localhost:${info.port}`);
});

export type AppType = typeof app;
