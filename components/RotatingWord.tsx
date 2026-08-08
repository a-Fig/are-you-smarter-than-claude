"use client";

import { useEffect, useState } from "react";

export function RotatingWord({
  words,
  intervalMs,
  className,
}: {
  words: readonly string[];
  intervalMs: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs]);

  return (
    <span className="inline-block overflow-hidden align-bottom py-1">
      <span key={index} className={`inline-block animate-word-in ${className ?? ""}`}>
        {words[index]}
      </span>
    </span>
  );
}
