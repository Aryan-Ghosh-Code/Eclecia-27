"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, type CSSProperties } from "react";
import { ASSETS } from "@/constants/assets";
import { LOADER } from "@/constants/loader";

/**
 * The SSR'd markup's CSS keyframes start at first paint, before hydration.
 * JS only decides when to exit: after the intro, once the window has loaded
 * (capped at maxWaitMs).
 */
function firstPaintMs(): Promise<number> {
  const fcp = performance.getEntriesByName("first-contentful-paint")[0];
  if (fcp) return Promise.resolve(fcp.startTime);
  // Hydrated before first paint (common in dev): the next frame is that paint.
  return new Promise((res) => requestAnimationFrame(res));
}

const art = (src: string, className: string, style?: CSSProperties) => (
  <img
    src={src}
    alt=""
    aria-hidden
    draggable={false}
    decoding="async"
    className={`pointer-events-none max-w-none select-none ${className}`}
    style={style}
  />
);

const vars = (v: Record<string, string | number>) => v as CSSProperties;

const CATEGORIES = ["Music", "Dance", "Drama", "Art", "Fashion", "Literary"];

/**
 * Gold dust that gathers into the sun: golden-angle spiral, so it is spread
 * evenly and identical on server and client (values rounded for hydration).
 */
const DUST = Array.from({ length: 24 }, (_, i) => {
  const a = i * 2.39996;
  const r = 34 + ((i * 37) % 31);
  return vars({
    "--dx": (Math.cos(a) * r).toFixed(2),
    "--dy": (Math.sin(a) * r).toFixed(2),
    "--sz": `${2 + ((i * 7) % 4)}px`,
    "--d": `${(0.55 + (i % 8) * 0.055).toFixed(3)}s`,
  });
});

/**
 * Opening loader: totality, staged like curtain-up. A title card; gold dust
 * gathers into a sun while the event categories light up; the black moon
 * crosses it, a diamond-ring flash, the corona blooms; the scene's art
 * figures rise into its light; the wordmark is painted on over a lotus divider. Every
 * eclipse layer sits exactly on the hero's (see bootScript.ts), so the exit
 * iris, opening from the moon's centre, hands over to the identical eclipse
 * underneath. Timeline: styles/loader.css.
 */
export function SiteLoader() {
  const [phase, setPhase] = useState<"intro" | "exit" | "gone">("intro");

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).has("loader");
    const skip = !forced && !!document.documentElement.dataset.loaderSkip;
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
      const start = await firstPaintMs();

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

        <div className="ld-figures">
          {art(ASSETS.cloudinary.banner, "ld-figure ld-figure--banner ld-figure--banner-l", vars({ "--i": 0 }))}
          {art(ASSETS.cloudinary.banner, "ld-figure ld-figure--banner ld-figure--banner-r", vars({ "--i": 0 }))}
          {art(ASSETS.cloudinary.veena, "ld-figure ld-figure--veena", vars({ "--i": 1 }))}
          {art(ASSETS.cloudinary.hand, "ld-figure ld-figure--hand", vars({ "--i": 2 }))}
        </div>

        <div className="ld-dust" aria-hidden>
          {DUST.map((style, i) => (
            <span key={i} style={style} />
          ))}
        </div>

        <div className="ld-stage">
          {art(ASSETS.cloudinary.blacksun, "ld-rays")}
          <div className="ld-sun" />
          {art(ASSETS.cloudinary.blacksun2, "ld-moon")}
          <span className="ld-diamond" />
          {art(ASSETS.cloudinary.minisun, "ld-minisun")}
        </div>

        <div className="ld-caption">
          <ul className="ld-cats font-taiganja">
            {CATEGORIES.map((c, i) => (
              <li key={c} style={vars({ "--i": i })}>
                {c}
              </li>
            ))}
          </ul>
          <div
            className="ld-wm"
            style={vars({ "--ld-wm": `url(${ASSETS.cloudinary.wordmarkBlacker})` })}
          >
            {art(ASSETS.cloudinary.wordmarkBlacker, "ld-wordmark")}
            <span className="ld-glint" />
          </div>
          {art(ASSETS.cloudinary.divider, "ld-divider")}
        </div>

        <div className="ld-title">
          <p className="ld-title-eyebrow font-taiganja">
            Students of Heritage Institute of Technology, Kolkata
          </p>
          <p className="ld-title-presents font-display italic">presents</p>
        </div>
      </div>
    </div>
  );
}
