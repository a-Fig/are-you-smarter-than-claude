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
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.2em] text-black/70">
        Your opponent
      </span>
      <div className="flex flex-wrap justify-center gap-3" role="radiogroup" aria-label="Opponent model">
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
              className={`border-2 border-black px-4 py-1.5 text-sm uppercase transition-[transform,box-shadow] duration-100 ${
                selected
                  ? "translate-x-[2px] translate-y-[2px] bg-[#FF5C39] shadow-[1px_1px_0_#000]"
                  : "bg-white shadow-[3px_3px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000]"
              } ${locked && !selected ? "opacity-40" : ""}`}
            >
              {m.label}
              <span className="ml-1.5 font-sans text-[10px] font-bold normal-case text-black/60">
                {m.tagline}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
