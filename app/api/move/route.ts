import Anthropic from "@anthropic-ai/sdk";
import { GAME_REGISTRY } from "@/lib/games/registry";
import type { MoveResponse } from "@/lib/games/types";
import { MODELS, costUsd, isModelKey } from "@/lib/models";
import { checkRateLimit } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 3;
const MAX_TOKENS = 300;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Server is missing its Claude API key." },
      { status: 500 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limited = checkRateLimit(ip);
  if (limited) {
    return Response.json({ error: limited }, { status: 429 });
  }

  let body: { game?: string; state?: unknown; model?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const engine = body.game ? GAME_REGISTRY[body.game] : undefined;
  if (!engine) {
    return Response.json({ error: "Unknown game." }, { status: 400 });
  }
  const modelKey = body.model && isModelKey(body.model) ? body.model : "sonnet";
  const model = MODELS[modelKey];

  let state;
  try {
    state = engine.parseState(body.state);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Invalid state." },
      { status: 400 },
    );
  }

  const client = new Anthropic({ timeout: 60_000 });

  const tool: Anthropic.Tool = {
    name: "make_move",
    description: `Submit your next move in ${engine.name}.`,
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        ...engine.moveProperties,
        trash_talk: {
          type: "string",
          description:
            "One short line of playful, PG trash talk directed at your human opponent.",
        },
      },
      required: [...engine.moveRequired, "trash_talk"],
      additionalProperties: false,
    },
  };

  // Haiku 4.5 predates the disabled-thinking param; Sonnet 5 / Opus 5 think
  // by default, which is slow and expensive for a game move — turn it off.
  const thinking: Anthropic.ThinkingConfigParam | undefined =
    modelKey === "haiku" ? undefined : { type: "disabled" };

  const start = Date.now();
  let inputTokens = 0;
  let outputTokens = 0;
  let validationError: string | null = null;
  let move: Record<string, unknown> | null = null;
  let trashTalk = "";

  try {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const prompt =
        engine.renderForClaude(state) +
        (validationError
          ? `\n\nYour previous move was rejected: ${validationError} Choose a legal move.`
          : "");

      const response = await client.messages.create({
        model: model.apiId,
        max_tokens: MAX_TOKENS,
        system: engine.systemPrompt,
        ...(thinking ? { thinking } : {}),
        tools: [tool],
        tool_choice: { type: "tool", name: "make_move" },
        messages: [{ role: "user", content: prompt }],
      });

      inputTokens += response.usage.input_tokens;
      outputTokens += response.usage.output_tokens;

      const toolUse = response.content.find(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
      );
      if (!toolUse) {
        validationError = "No move was submitted.";
        continue;
      }

      const { trash_talk, ...candidate } = toolUse.input as Record<string, unknown>;
      validationError = engine.validateMove(state, candidate);
      if (!validationError) {
        move = candidate;
        trashTalk = typeof trash_talk === "string" ? trash_talk : "";
        break;
      }
    }
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      const status = e.status === 429 || e.status === 529 ? 503 : 502;
      return Response.json(
        { error: `Claude is unavailable right now (${e.status ?? "network"}).` },
        { status },
      );
    }
    throw e;
  }

  let fallback = false;
  if (!move) {
    move = engine.fallbackMove(state);
    trashTalk = "I fumbled that one. Lucky you.";
    fallback = true;
  }

  const payload: MoveResponse = {
    move,
    trashTalk,
    fallback,
    stats: {
      latencyMs: Date.now() - start,
      inputTokens,
      outputTokens,
      costUsd: costUsd(model, inputTokens, outputTokens),
      model: model.apiId,
      modelLabel: model.label,
    },
  };
  return Response.json(payload);
}
