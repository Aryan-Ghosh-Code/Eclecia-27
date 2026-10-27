"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { ASSETS } from "@/constants/assets";
import { LOADER } from "@/constants/loader";

/**
 * The SSR'd markup's CSS keyframes start at first paint, before hydration.
 * JS only decides when to exit: after the intro, once the window has loaded
 * (capped at maxWaitMs).
 */
function firstPaintMs(): number {
  const fcp = performance.getEntriesByName("first-contentful-paint")[0];
  return fcp ? fcp.startTime : performance.now();
}

const art = (src: string, className: string) => (
  <img
    src={src}
    alt=""
    aria-hidden
    draggable={false}
    decoding="async"
    className={`pointer-events-none max-w-none select-none ${className}`}
  />
);

/**
 * Opening loader: totality. A gold sun, the black moon slides across it, a
 * diamond-ring flash at second contact, then the corona (the hero's rays
 * layer) blooms and the mini sun lights. Every layer sits exactly on the
 * hero's eclipse (see bootScript.ts), so the exit iris, opening from the
 * moon's centre, hands over to the identical eclipse underneath.
 */
export function SiteLoader() {
  const [phase, setPhase] = useState<"intro" | "exit" | "gone">("intro");

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).has("loader");
    const skip = !forced && !!document.documentElement.dataset.loaderSkip;
    const start = firstPaintMs();
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

  return (
    <div
      className={`site-loader${phase === "exit" ? " is-exit" : ""}`}
      role="status"
      aria-label="Loading Eclecia"
    >
      <div className="ld-eclipse">
        {art(ASSETS.cloudinary.bg, "ld-sky")}
        <div className="ld-stage">
          <svg className="ld-orbit" viewBox="0 0 100 100" aria-hidden>
            <circle cx="50" cy="50" r="49" pathLength={1} />
          </svg>
          {art(ASSETS.cloudinary.blacksun, "ld-rays")}
          <div className="ld-sun" />
          {art(ASSETS.cloudinary.blacksun2, "ld-moon")}
          <span className="ld-diamond" />
          {art(ASSETS.cloudinary.minisun, "ld-minisun")}
        </div>
        <div className="ld-caption">
          <p className="ld-eyebrow font-taiganja">
            Heritage Institute of Technology, Kolkata
          </p>
          {art(ASSETS.cloudinary.wordmarkBlacker, "ld-wordmark")}
        </div>
      </div>
    </div>
  );
}
