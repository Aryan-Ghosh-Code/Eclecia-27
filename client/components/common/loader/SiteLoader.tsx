"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type CSSProperties } from "react";
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
  const rootRef = useRef<HTMLDivElement>(null);

  // Match the actual rendered hero image, including its responsive panel scale,
  // font-dependent offsets and bounds fitting, rather than duplicating its math.
  useEffect(() => {
    if (phase === "gone" || window.location.pathname !== "/") return;
    const root = rootRef.current;
    if (!root) return;
    let image: HTMLImageElement | null = null;
    let panel: HTMLElement | null = null;
    let cancelled = false;
    let frame = 0;
    const measure = () => {
      if (cancelled) return;
      const rect = image?.getBoundingClientRect();
      if (!rect?.width || !rect.height) return;
      root.style.setProperty("--ld-wmx", `${rect.left + rect.width / 2}px`);
      root.style.setProperty("--ld-wmy", `${rect.top + rect.height / 2}px`);
      root.style.setProperty("--ld-wmw", `${rect.width}px`);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { frame = requestAnimationFrame(measure); });
    };
    const observer = new ResizeObserver(schedule);
    const bindImage = () => {
      const next = document.querySelector<HTMLImageElement>("[data-hero-wordmark]");
      if (next === image) return;
      if (image) {
        observer.unobserve(image);
        image.removeEventListener("load", schedule);
      }
      if (panel) observer.unobserve(panel);
      image = next;
      panel = image?.closest("section") ?? null;
      if (image) {
        observer.observe(image);
        image.addEventListener("load", schedule);
      }
      if (panel) observer.observe(panel);
      schedule();
    };
    // The landing swaps its frame-space image for a viewport-space image on
    // phones after hydration. Follow that replacement instead of the stale node.
    const mounts = new MutationObserver(bindImage);
    mounts.observe(document.body, { childList: true, subtree: true });
    bindImage();
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    void document.fonts.ready.then(() => { if (!cancelled) schedule(); });
    measure();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      mounts.disconnect();
      image?.removeEventListener("load", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
    };
  }, [phase]);

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
      ref={rootRef}
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
          <div className="ld-sun">
            {art(
              ASSETS.cloudinary.loaderSun ||
                "/assets/opt/loader/painted-sun-v1.webp",
              "ld-sun-art",
            )}
          </div>
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
        </div>

        <div className="ld-brand">
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
