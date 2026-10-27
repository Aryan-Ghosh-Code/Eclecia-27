"use client";

import { useEffect, useState } from "react";
import {
  LOADER,
  LOADER_VARIANTS,
  type LoaderVariant,
} from "@/constants/loader";
import { CurtainLoader, EclipseLoader, YantraLoader } from "./variants";

const VIEWS = {
  eclipse: EclipseLoader,
  curtain: CurtainLoader,
  yantra: YantraLoader,
} as const;

/** `?loader=curtain` or `?loader=2` → variant; anything else → null. */
function variantFromQuery(q: string | null): LoaderVariant | null {
  if (!q) return null;
  const n = Number(q);
  if (Number.isInteger(n) && n >= 1 && n <= LOADER_VARIANTS.length) {
    return LOADER_VARIANTS[n - 1];
  }
  return (LOADER_VARIANTS as readonly string[]).includes(q)
    ? (q as LoaderVariant)
    : null;
}

/**
 * The SSR'd markup is the default variant, so its CSS keyframes start at
 * first paint, before hydration. JS only decides when to exit: after the
 * intro, once the window has loaded (capped at maxWaitMs).
 */
function firstPaintMs(): number {
  const fcp = performance.getEntriesByName("first-contentful-paint")[0];
  return fcp ? fcp.startTime : performance.now();
}

export function SiteLoader() {
  const [variant, setVariant] = useState<LoaderVariant>(LOADER.variant);
  const [phase, setPhase] = useState<"intro" | "exit" | "gone">("intro");
  /** performance.now() at which the current variant's keyframes started. */
  const [origin, setOrigin] = useState<number | null>(null);

  useEffect(() => {
    const forced = variantFromQuery(
      new URLSearchParams(window.location.search).get("loader"),
    );
    const skip = !forced && !!document.documentElement.dataset.loaderSkip;
    // A forced variant remounts under a new key, so its keyframes restart now.
    const switching = !!forced && forced !== LOADER.variant;
    const start = switching ? performance.now() : firstPaintMs();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const introMs = reduce ? 400 : LOADER.buildMs;

    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => {
        timers.push(window.setTimeout(res, Math.max(0, ms)));
      });
    const loaded = new Promise<void>((res) => {
      if (document.readyState === "complete") res();
      else window.addEventListener("load", () => res(), { once: true });
    });

    let cancelled = false;
    (async () => {
      await wait(0);
      if (cancelled) return;
      if (skip) return setPhase("gone");
      if (switching) setVariant(forced);
      setOrigin(start);

      await wait(start + introMs - performance.now());
      await Promise.race([
        loaded,
        wait(start + LOADER.maxWaitMs - performance.now()),
      ]);
      if (cancelled) return;
      setPhase("exit");
      if (LOADER.oncePerSession) {
        try {
          sessionStorage.setItem(LOADER.storageKey, "1");
        } catch {}
      }
      await wait(LOADER.exitMs);
      if (!cancelled) setPhase("gone");
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  if (phase === "gone") return null;

  const View = VIEWS[variant];
  return (
    <div
      key={variant}
      className={`site-loader site-loader--${variant}${phase === "exit" ? " is-exit" : ""}`}
      role="status"
      aria-label="Loading Eclecia"
    >
      <View origin={origin} />
    </div>
  );
}
