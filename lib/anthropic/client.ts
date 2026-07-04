import Anthropic from "@anthropic-ai/sdk";

/** Solo para uso en servidor (Route Handlers, Server Actions). */
export function createAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY no está configurada");
  }

  return new Anthropic({ apiKey });
}

export const ANTHROPIC_MODEL_HAIKU = "claude-haiku-4-5";
