import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";

const PATH = "/api/chat";

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString() || "{}";
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function bearer(req) {
  const header = req.headers.authorization ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(Array.isArray(header) ? header[0] : header);
  return match?.[1]?.trim() ?? "";
}

async function handle(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method not allowed");
    return;
  }

  const apiKey = bearer(req);
  if (!apiKey) {
    res.statusCode = 401;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "Missing ParsPack API key" }));
    return;
  }

  let body;
  try {
    body = await readJson(req);
  } catch {
    res.statusCode = 400;
    res.end("Invalid JSON");
    return;
  }

  const modelId = typeof body.model === "string" && body.model ? body.model : "abrha/free-model";
  const provider = createOpenAI({
    apiKey,
    baseURL: "https://ai.parspack.com/v1",
  });

  try {
    const result = streamText({
      model: provider.responses(modelId),
      messages: await convertToModelMessages(body.messages ?? []),
    });
    await result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    if (res.headersSent) return;
    res.statusCode = 502;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Chat request failed" }));
  }
}

function attach(middlewares) {
  middlewares.use(async (req, res, next) => {
    const path = req.url?.split("?")[0];
    if (path !== PATH) return next();
    await handle(req, res);
  });
}

export function parspackChat() {
  return {
    name: "parspack-chat",
    configureServer(server) {
      attach(server.middlewares);
    },
    configurePreviewServer(server) {
      attach(server.middlewares);
    },
  };
}
