"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

const ADJS = ["smarter", "faster", "cheaper", "more human"] as const;
const MODELS = ["Claude", "Haiku", "Sonnet", "Opus", "Fable", "Mythos"] as const;
const ROTATE_MS = 2000;
const SLOT_HEIGHT_EM = 1.15;

function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Shuffle bag: every word plays once in random order before the bag
   reshuffles, and the reshuffle is nudged so it never repeats the word
   that just played — Spotify-style shuffle, no back-to-back repeats. */
function drawBag(words: readonly string[], avoid: string): string[] {
  const bag = shuffle(words);
  if (bag.length > 1 && bag[0] === avoid) {
    [bag[0], bag[1]] = [bag[1], bag[0]];
  }
  return bag;
}

/* Slot-machine reel: every word (plus a duplicate of the first) lives in
   the DOM so the chip is always sized to the widest word and the
   surrounding text never reflows. The track steps upward through the
   current draw order with a hard-cut steps() transition and snaps back
   invisibly on wraparound, at which point the order is reshuffled. */
function useReel(words: readonly string[]) {
  const topRef = useRef<HTMLSpanElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef(0);
  const orderRef = useRef<string[]>([...words]);

  // Deterministic default order for SSR (words[0] first, matching the
  // fallback below) — reshuffled client-side once mounted.
  const [order, setOrder] = useState<string[]>(orderRef.current);

  useEffect(() => {
    const reshuffled = [words[0], ...shuffle(words.slice(1))];
    orderRef.current = reshuffled;
    setOrder(reshuffled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advance = () => {
    const els = [topRef.current, shadowRef.current].filter(
      (el): el is HTMLSpanElement => el !== null,
    );
    indexRef.current += 1;
    const i = indexRef.current;
    els.forEach((el) => {
      el.style.transition = "transform 160ms steps(3, jump-end)";
      el.style.transform = `translateY(-${i * SLOT_HEIGHT_EM}em)`;
    });
    if (i === orderRef.current.length) {
      setTimeout(() => {
        els.forEach((el) => {
          el.style.transition = "none";
          el.style.transform = "translateY(0em)";
        });
        indexRef.current = 0;
        const last = orderRef.current[orderRef.current.length - 1];
        const next = drawBag(words, last);
        orderRef.current = next;
        setOrder(next);
      }, 170);
    }
  };

  return { topRef, shadowRef, order, advance };
}

function ReelTrack({
  words,
  trackRef,
}: {
  words: string[];
  trackRef: React.Ref<HTMLSpanElement>;
}) {
  return (
    <span className={styles.reelWord}>
      <span className={styles.reelTrack} ref={trackRef}>
        {[...words, words[0]].map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </span>
    </span>
  );
}

export default function Home() {
  const adj = useReel(ADJS);
  const model = useReel(MODELS);

  useEffect(() => {
    const id = setInterval(() => {
      adj.advance();
      model.advance();
    }, ROTATE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.stage}>
        <h1 className={styles.headline} aria-live="polite">
          <span className={styles.layerShadow} aria-hidden="true">
            <span className={styles.line}>
              Are you{" "}
              <span className={styles.chip}>
                <ReelTrack words={adj.order} trackRef={adj.shadowRef} />
              </span>
            </span>
            <span className={styles.line}>
              than{" "}
              <span className={styles.chip}>
                <ReelTrack words={model.order} trackRef={model.shadowRef} />
              </span>
              ?
            </span>
          </span>
          <span className={styles.layerTop}>
            <span className={styles.line}>
              Are you{" "}
              <span className={styles.chip}>
                <ReelTrack words={adj.order} trackRef={adj.topRef} />
              </span>
            </span>
            <span className={styles.line}>
              than{" "}
              <span className={styles.chip}>
                <ReelTrack words={model.order} trackRef={model.topRef} />
              </span>
              ?
            </span>
          </span>
        </h1>

        <Link className={styles.playBtn} href="/play">
          Play
        </Link>
      </div>
    </main>
  );
}
