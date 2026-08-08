"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./page.module.css";

const ADJS = ["smarter", "faster", "cheaper", "more human"];
const MODELS = ["Claude", "Haiku", "Sonnet", "Opus", "Fable", "Mythos"];

/* Slot-machine reel: every word (plus a duplicate of the first) lives in the
   DOM so the chip is sized to the widest word; the track steps upward with a
   hard-cut steps() transition and snaps back invisibly on wraparound. */
function useReel(words: string[], intervalMs: number) {
  const topRef = useRef<HTMLSpanElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const els = [topRef.current, shadowRef.current].filter(
      (el): el is HTMLSpanElement => el !== null,
    );
    let index = 0;
    let snapTimer: ReturnType<typeof setTimeout> | undefined;

    const tick = setInterval(() => {
      index++;
      els.forEach((el) => {
        el.style.transition = "transform 160ms steps(3, jump-end)";
        el.style.transform = `translateY(-${index * 1.15}em)`;
      });
      if (index === words.length) {
        snapTimer = setTimeout(() => {
          els.forEach((el) => {
            el.style.transition = "none";
            el.style.transform = "translateY(0em)";
          });
          index = 0;
        }, 170);
      }
    }, intervalMs);

    return () => {
      clearInterval(tick);
      if (snapTimer) clearTimeout(snapTimer);
    };
  }, [words, intervalMs]);

  const track = (ref: typeof topRef) => (
    <span className={styles.reelWord}>
      <span className={styles.reelTrack} ref={ref}>
        {[...words, words[0]].map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </span>
    </span>
  );

  return { top: track(topRef), shadow: track(shadowRef) };
}

export default function Home() {
  const adj = useReel(ADJS, 1900);
  const model = useReel(MODELS, 1400);

  return (
    <main className={styles.main}>
      <div className={styles.stage}>
        <h1 className={styles.headline} aria-live="polite">
          <span className={styles.layerShadow} aria-hidden="true">
            <span className={styles.line}>
              Are you <span className={styles.chip}>{adj.shadow}</span>
            </span>
            <span className={styles.line}>
              than <span className={styles.chip}>{model.shadow}</span>?
            </span>
          </span>
          <span className={styles.layerTop}>
            <span className={styles.line}>
              Are you <span className={styles.chip}>{adj.top}</span>
            </span>
            <span className={styles.line}>
              than <span className={styles.chip}>{model.top}</span>?
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
