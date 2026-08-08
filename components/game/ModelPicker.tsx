"use client";

import { MODELS, MODEL_KEYS, type ModelKey } from "@/lib/models";

export function ModelPicker({
  value,
  onChange,
  locked,
}: {
  value: ModelKey;
  onChange: (key: ModelKey) => void;
  locked: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xs uppercase tracking-[0.15em] text-muted">
        Your opponent
      </span>
      <div className="flex gap-2" role="radiogroup" aria-label="Opponent model">
        {MODEL_KEYS.map((key) => {
          const m = MODELS[key];
          const selected = key === value;
          return (
            <button
              key={key}
              role="radio"
              aria-checked={selected}
              disabled={locked && !selected}
              onClick={() => !locked && onChange(key)}
              title={m.tagline}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                selected
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-transparent text-foreground hover:border-accent"
              } ${locked && !selected ? "opacity-40" : ""}`}
            >
              {m.label}
              <span className={`ml-1.5 text-xs ${selected ? "opacity-80" : "text-muted"}`}>
                {m.tagline}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
