export type ModelKey = "haiku" | "sonnet" | "opus";

export interface ModelInfo {
  key: ModelKey;
  apiId: string;
  label: string;
  tagline: string;
  /** USD per million input tokens */
  inputPerMTok: number;
  /** USD per million output tokens */
  outputPerMTok: number;
}

export const MODELS: Record<ModelKey, ModelInfo> = {
  haiku: {
    key: "haiku",
    apiId: "claude-haiku-4-5",
    label: "Haiku 4.5",
    tagline: "fast & cheap",
    inputPerMTok: 1,
    outputPerMTok: 5,
  },
  sonnet: {
    key: "sonnet",
    apiId: "claude-sonnet-5",
    label: "Sonnet 5",
    tagline: "the all-rounder",
    inputPerMTok: 3,
    outputPerMTok: 15,
  },
  opus: {
    key: "opus",
    apiId: "claude-opus-5",
    label: "Opus 5",
    tagline: "smart & pricey",
    inputPerMTok: 5,
    outputPerMTok: 25,
  },
};

export const MODEL_KEYS: ModelKey[] = ["haiku", "sonnet", "opus"];

export function isModelKey(value: string): value is ModelKey {
  return value in MODELS;
}

export function costUsd(
  model: ModelInfo,
  inputTokens: number,
  outputTokens: number,
): number {
  return (
    (inputTokens / 1_000_000) * model.inputPerMTok +
    (outputTokens / 1_000_000) * model.outputPerMTok
  );
}
