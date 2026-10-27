"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, type CSSProperties } from "react";
import { ASSETS } from "@/constants/assets";
import { LOADER } from "@/constants/loader";

/** Timings live in styles/loader.css; this only gets the clock for JS-driven bits. */
export type LoaderViewProps = { origin: number | null };

const art = (src: string, className: string, extra?: CSSProperties) => (
  <img
    src={src}
    alt=""
    aria-hidden
    draggable={false}
    decoding="async"
    className={`pointer-events-none max-w-none select-none ${className}`}
    style={extra}
  />
);

// ---------- 1. Eclipse: totality ----------
//
// A gold sun, the black moon slides across it, a diamond-ring flash at
// second contact, then the corona (the hero's rays layer) blooms and the
// mini sun lights on the moon exactly as it sits in the hero. Exit: an iris
// opens out of the moon's centre onto the site.

export function EclipseLoader() {
  return (
    <div className="ld-eclipse">
      {art(ASSETS.cloudinary.bg, "ld-sky")}
      <div className="ld-stage">
        <svg className="ld-orbit" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="49" pathLength={1} />
        </svg>
        <div className="ld-rays-spin">
          {art(ASSETS.cloudinary.blacksun, "ld-rays")}
        </div>
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
  );
}

// ---------- 2. Curtain call ----------
//
// Red velvet house curtain under a scalloped gold pelmet; a spotlight finds
// centre stage, the presenter line and wordmark take a bow, the lotus
// divider unfurls. Exit: the drapes gather to the wings.

export function CurtainLoader() {
  const grain = { "--ld-grain": `url(${ASSETS.cloudinary.bg})` } as CSSProperties;
  return (
    <div className="ld-curtain" style={grain}>
      <div className="ld-drape ld-drape--l" />
      <div className="ld-drape ld-drape--r" />
      <div className="ld-pelmet">
        <svg className="ld-scallops" aria-hidden>
          <defs>
            <linearGradient id="ld-pel-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4a0a0f" />
              <stop offset="1" stopColor="#240306" />
            </linearGradient>
            <pattern
              id="ld-scallop"
              width="72"
              height="44"
              patternUnits="userSpaceOnUse"
            >
              <path d="M0 0H72V14Q36 44 0 14Z" fill="url(#ld-pel-fill)" />
              <path
                d="M0 14Q36 44 72 14"
                fill="none"
                stroke="#d9a441"
                strokeWidth="1.6"
              />
              <path
                d="M0 10Q36 38 72 10"
                fill="none"
                stroke="#d9a441"
                strokeOpacity=".45"
                strokeWidth=".8"
              />
              <circle cx="36" cy="31" r="2.6" fill="#e9c27a" />
              <path d="M36 33.5l-2.2 7h4.4z" fill="#d9a441" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ld-scallop)" />
        </svg>
      </div>
      <div className="ld-spot" />
      <div className="ld-bill">
        <p className="ld-bill-eyebrow font-taiganja">
          Students of Heritage Institute of Technology, Kolkata
        </p>
        <p className="ld-bill-presents font-display italic">presents</p>
        <div
          className="ld-bill-wm"
          style={
            {
              "--ld-wm": `url(${ASSETS.cloudinary.wordmarkBlacker})`,
            } as CSSProperties
          }
        >
          {art(ASSETS.cloudinary.wordmarkBlacker, "ld-bill-wm-img")}
          <span className="ld-sheen" />
        </div>
        {art(ASSETS.cloudinary.divider, "ld-bill-divider")}
      </div>
      <div className="ld-cue" />
    </div>
  );
}

// ---------- 3. Yantra ----------
//
// A gold yantra draws itself line by line (petals in the divider's crimson
// and teal), with a load counter at its heart. Exit: the camera dives
// through the mandala into the site.

const PETALS_OUTER = Array.from({ length: 16 }, (_, i) => i * 22.5);
const PETALS_INNER = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5);
const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);

function Counter({ origin }: LoaderViewProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (origin === null) return;
    let id = 0;
    const span = LOADER.buildMs - 200;
    const tick = () => {
      const t = Math.min(1, (performance.now() - origin) / span);
      const v = Math.round((1 - Math.pow(1 - t, 3)) * 100);
      if (ref.current) ref.current.textContent = String(v).padStart(2, "0");
      if (t < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [origin]);
  return (
    <span ref={ref} className="ld-count font-display">
      00
    </span>
  );
}

export function YantraLoader({ origin }: LoaderViewProps) {
  return (
    <div className="ld-yantra">
      {art(ASSETS.cloudinary.bg, "ld-sky")}
      <div className="ld-mandala">
        <svg viewBox="-200 -200 400 400" aria-hidden>
          <g className="ld-spin-cw">
            <circle className="ld-draw" r="192" pathLength={1} style={{ "--d": "0s" } as CSSProperties} />
            <g className="ld-ticks">
              {TICKS.map((a) => (
                <line
                  key={a}
                  y1={a % 30 === 0 ? -170 : -176}
                  y2={-184}
                  transform={`rotate(${a})`}
                />
              ))}
            </g>
          </g>
          <g className="ld-spin-ccw">
            {[0, 45].map((a, i) => (
              <rect
                key={a}
                className="ld-draw"
                x="-118"
                y="-118"
                width="236"
                height="236"
                pathLength={1}
                transform={`rotate(${a})`}
                style={{ "--d": `${0.25 + i * 0.15}s` } as CSSProperties}
              />
            ))}
            <circle className="ld-draw" r="152" pathLength={1} style={{ "--d": "0.35s" } as CSSProperties} />
            {PETALS_OUTER.map((a, i) => (
              <path
                key={a}
                className="ld-draw ld-petal ld-petal--outer"
                d="M0-96C16-104 26-126 0-156C-26-126-16-104 0-96Z"
                pathLength={1}
                transform={`rotate(${a})`}
                style={{ "--d": `${0.5 + i * 0.035}s` } as CSSProperties}
              />
            ))}
          </g>
          <g className="ld-spin-cw">
            {PETALS_INNER.map((a, i) => (
              <path
                key={a}
                className="ld-draw ld-petal ld-petal--inner"
                d="M0-60C22-66 32-82 0-104C-32-82-22-66 0-60Z"
                pathLength={1}
                transform={`rotate(${a})`}
                style={{ "--d": `${0.8 + i * 0.04}s` } as CSSProperties}
              />
            ))}
            <path
              className="ld-draw"
              d="M0-58L50.2 29L-50.2 29Z"
              pathLength={1}
              style={{ "--d": "1.05s" } as CSSProperties}
            />
            <path
              className="ld-draw"
              d="M0 58L50.2-29L-50.2-29Z"
              pathLength={1}
              style={{ "--d": "1.15s" } as CSSProperties}
            />
          </g>
          <circle className="ld-draw" r="58" pathLength={1} style={{ "--d": "0.95s" } as CSSProperties} />
          <circle className="ld-pulse" r="58" />
        </svg>
        <div className="ld-core">
          <Counter origin={origin} />
          <span className="ld-core-label font-taiganja">Eclecia</span>
        </div>
      </div>
      <p className="ld-yantra-caption font-taiganja">
        Heritage Institute of Technology, Kolkata
      </p>
    </div>
  );
}
