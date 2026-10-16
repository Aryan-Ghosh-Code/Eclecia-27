"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { sceneConfig as cfg } from "@/constants/scene.config";
import { GoldButton } from "@/components/common/GoldButton";
import { ASSETS } from "@/constants/assets";

export type Emerge = {
  /** 0..1 progress of the slide-out from behind the moon. */
  t: number;
  /** Where the panel starts (moon centre), in the same px space as `rect`. */
  fromX: number;
  fromY: number;
};

export type Rect = { x: number; y: number; w: number };

type Scrim = { opacity: number; bleedPx: number };

/** Visible vertical band (px, same space as `rect`) the panel must stay inside. */
export type Bounds = { top: number; bottom: number };

type OverlayProps = {
  opacity: number;
  emerge: Emerge;
  /** Position in px of whatever container the panel is rendered in (frame or viewport). */
  rect: Rect;
  /** If given, the panel scales down and shifts so it never leaves this band. */
  bounds?: Bounds;
  align: "left" | "center" | "right";
  scrim?: Scrim;
  z?: number;
  /** Mobile: tighter spacing. */
  compact?: boolean;
  /** Extra uniform scale (tablets render phone markup larger). */
  scale?: number;
  children: ReactNode;
};

/**
 * Text panel. On desktop it lives inside the 1512x864 frame (under the moon
 * layers, so the moon uncovers it); on mobile it lives in a viewport layer.
 */
function Overlay({
  opacity,
  emerge,
  rect,
  bounds,
  align,
  scrim: scrimOverride,
  z = 90,
  compact = false,
  scale: extra = 1,
  children,
}: OverlayProps) {
  const hidden = opacity < 0.01;
  const ref = useRef<HTMLElement>(null);
  const [naturalH, setNaturalH] = useState(0);
  // Measure the untransformed height so we can fit it into the visible band.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setNaturalH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fit: shrink if taller than the band (with breathing room), then keep the
  // centre inside the band so neither edge clips.
  let fit = 1;
  let cy = rect.y;
  if (bounds && naturalH > 0) {
    const pad = 16;
    const avail = bounds.bottom - bounds.top - pad * 2;
    fit = Math.min(1, avail / (naturalH * extra));
    const half = (naturalH * extra * fit) / 2;
    cy = Math.min(
      Math.max(rect.y, bounds.top + pad + half),
      bounds.bottom - pad - half,
    );
  }

  const cx = rect.x + rect.w / 2;
  const dx = (emerge.fromX - cx) * (1 - emerge.t);
  const dy = (emerge.fromY - cy) * (1 - emerge.t) + (cy - rect.y);
  const sc =
    (cfg.textEmergeScale + (1 - cfg.textEmergeScale) * emerge.t) * fit * extra;
  const style: CSSProperties = {
    left: rect.x,
    top: rect.y,
    width: rect.w,
    opacity,
    transform: `translate(${dx}px, calc(${dy}px - 50%)) scale(${sc})`,
    transformOrigin: "center",
    zIndex: z, // default 15: above bg (10), below rays (20) and moon (30)
    pointerEvents: hidden ? "none" : "auto",
    visibility: hidden ? "hidden" : "visible",
  };
  const side =
    align === "right"
      ? "items-end text-right"
      : align === "center"
        ? "items-center text-center"
        : "items-start text-left";
  const scrim: Scrim = scrimOverride ?? cfg.textScrim;
  return (
    <section
      ref={ref}
      className={`text-panel-shadow absolute flex flex-col will-change-[transform,opacity] ${compact ? "gap-5" : "gap-8"} ${side}`}
      style={style}
    >
      {/* Soft dark halo so type stays readable over ornaments and rays */}
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10"
        style={{
          inset: -scrim.bleedPx,
          background: `radial-gradient(ellipse at center, rgba(4,4,8,${scrim.opacity}) 0%, rgba(4,4,8,${
            scrim.opacity * 0.9
          }) 35%, rgba(4,4,8,${scrim.opacity * 0.55}) 55%, rgba(4,4,8,${scrim.opacity * 0.22}) 72%, rgba(4,4,8,${
            scrim.opacity * 0.06
          }) 86%, rgba(4,4,8,0) 100%)`,
        }}
      />
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-taiganja text-[13px] uppercase tracking-[0.35em] text-gold/80 text-balance">
      {children}
    </p>
  );
}

/** Lotus divider (assets-src/divider.png). The PNG has generous padding, hence the negative margins. */
function Ornament({ compact = false }: { compact?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ASSETS.cloudinary.divider}
      alt=""
      draggable={false}
      className={`pointer-events-none max-w-none select-none ${compact ? "-my-6 w-70" : "-my-9 w-130"}`}
    />
  );
}

function Title({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <h2
      className={`font-display font-semibold leading-[0.95] tracking-[-0.015em] text-parchment ${
        compact ? "text-[40px]" : "text-[72px]"
      }`}
    >
      {children}
    </h2>
  );
}

export type SectionProps = {
  opacity: number;
  emerge: Emerge;
  rect: Rect;
  bounds?: Bounds;
  compact?: boolean;
  scale?: number;
  isTablet?: boolean;
};

// ---------- hero: wordmark ----------

export function HeroSection({
  opacity,
  emerge,
  rect,
  bounds,
  compact,
  scale,
}: SectionProps) {
  const c = cfg.text.hero;
  return (
    <Overlay
      opacity={opacity}
      emerge={emerge}
      rect={rect}
      bounds={bounds}
      scale={scale}
      align={c.align}
      scrim={c.scrim}
      z={c.z}
      compact={compact}
    >
      <div className="flex w-full flex-col items-center gap-1">
        <p
          className={`font-taiganja font-medium uppercase leading-none tracking-[0.22em] text-parchment/90 ${
            compact ? "text-[10px]" : "text-[13px]"
          }`}
        >
          Students of Heritage Institute of Technology, Kolkata
        </p>
        <p
          className={`font-display italic leading-none text-parchment/80 ${compact ? "text-[16px]" : "text-[22px]"}`}
        >
          presents
        </p>
        <h1 className="sr-only">ECLECIA</h1>
        {/* Dark gradient behind wordmark for legibility over artwork */}
        <div className={`relative ${compact ? "mt-2" : "mt-2"}`}>
          {compact && (
            <div
              className="pointer-events-none absolute -inset-6 -inset-x-10 rounded-2xl"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 50%, transparent 80%)",
              }}
              aria-hidden
            />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ASSETS.cloudinary.wordmarkBlacker}
            alt="ECLECIA"
            draggable={false}
            className={`relative select-none object-contain ${
              compact
                ? "h-40 sm:h-48 w-auto max-w-[96vw] drop-shadow-xl"
                : "h-48 md:h-56 lg:h-64 max-h-[24vh] w-auto drop-shadow-2xl"
            }`}
          />
        </div>
      </div>
    </Overlay>
  );
}

// ---------- section 1: stats ----------

// Numbers from the Eclecia'27 sponsorship brochure.
const STATS = [
  { value: "3", label: "Days" },
  { value: "25+", label: "Events" },
  { value: "40+", label: "Colleges" },
  { value: "20K+", label: "Footfall" },
];

export function StatsSection({
  opacity,
  emerge,
  rect,
  bounds,
  compact,
  scale,
  isTablet,
}: SectionProps) {
  const c = cfg.text.stats;
  return (
    <Overlay
      opacity={opacity}
      emerge={emerge}
      rect={rect}
      bounds={bounds}
      scale={scale}
      align={c.align}
      scrim={c.scrim}
      compact={compact}
    >
      <div
        className={`flex w-full flex-col items-center ${compact ? "gap-3" : "gap-5"}`}
      >
        <Eyebrow>Eclecia&apos;27: The annual cultural fest of HITK</Eyebrow>
        <Title compact={compact}>
          Where passion
          <br />
          <em className="font-nasyhama font-normal italic text-gold">
            meets performance.
          </em>
        </Title>
        <Ornament compact={compact} />
        <p
          className={`max-w-[54ch] leading-relaxed text-parchment/75 ${
            isTablet ? "text-[20px]" : compact ? "text-[14px]" : "text-[17px]"
          }`}
        >
          Eclecia invites performers, artists and dreamers to showcase their
          talent and embrace the true essence of culture. Three days at Heritage
          Institute of Technology, Kolkata.
        </p>
      </div>
      <dl
        className={`grid w-full border-y border-gold/25 ${
          compact
            ? "grid-cols-2 gap-y-5 py-4 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-gold/20"
            : "grid-cols-4 divide-x divide-gold/20 py-6"
        }`}
      >
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-2 px-4">
            <dd
              className={`font-display font-semibold leading-none text-gold ${compact ? "text-[36px]" : "text-[56px]"}`}
            >
              {s.value}
            </dd>
            <dt className="font-mono text-[11px] uppercase tracking-[0.3em] text-parchment/60">
              {s.label}
            </dt>
          </div>
        ))}
      </dl>
    </Overlay>
  );
}

// ---------- section 2: dates (reveal + countdown) ----------

type Parts = { d: number; h: number; m: number; s: number } | null;

function partsUntil(iso: string): Parts {
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return null;
  const t = Math.floor(ms / 1000);
  return {
    d: Math.floor(t / 86400),
    h: Math.floor((t % 86400) / 3600),
    m: Math.floor((t % 3600) / 60),
    s: t % 60,
  };
}

/** Ticks once a second after mount (renders dashes on the server / first paint). */
function useCountdown(iso: string) {
  const [parts, setParts] = useState<Parts | "pending">("pending");
  useEffect(() => {
    const tick = () => setParts(partsUntil(iso));
    const id = window.setInterval(tick, 1000);
    // First real value on the next frame, never during hydration.
    const raf = requestAnimationFrame(tick);
    return () => {
      window.clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, [iso]);
  return parts;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** One unit of the countdown; digits re-mount on change so they tick in. */
function Unit({
  value,
  label,
  compact,
  glitch,
}: {
  value: string;
  label: string;
  compact: boolean;
  glitch: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`countdown-glow flex font-display font-semibold leading-none text-gold tabular-nums ${
          glitch ? "glitch" : ""
        } ${compact ? "text-[44px]" : "text-[72px]"}`}
        data-text={value}
        aria-label={glitch ? `${label} hidden` : `${value} ${label}`}
      >
        {value.split("").map((ch, i) => (
          <span
            key={`${i}-${ch}`}
            className={glitch ? "inline-block" : "tick-in inline-block"}
          >
            {ch}
          </span>
        ))}
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-parchment/55">
        {label}
      </span>
    </div>
  );
}

/** Random two-digit strings that change at uneven, jittery intervals. */
function useScrambledUnits() {
  const [v, setV] = useState({ d: "88", h: "88", m: "88", s: "88" });
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t = 0;
    const rnd = () => String(Math.floor(Math.random() * 100)).padStart(2, "0");
    const tick = () => {
      setV((old) => {
        // Seconds always churn; the others only sometimes, so it reads like a signal fighting through.
        const burst = Math.random() < 0.12;
        return {
          d: burst || Math.random() < 0.08 ? rnd() : old.d,
          h: burst || Math.random() < 0.15 ? rnd() : old.h,
          m: burst || Math.random() < 0.3 ? rnd() : old.m,
          s: rnd(),
        };
      });
      t = window.setTimeout(tick, 70 + Math.random() * 220);
    };
    tick();
    return () => window.clearTimeout(t);
  }, []);
  return v;
}

/**
 * The dates, laid out like the timer: big day on top, month underneath, one
 * unit per fest day. Hidden: "XX" / "XXX" that occasionally scramble
 * (digits for the day, letters for the month) and settle back.
 */
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
type DayUnit = { day: string; month: string };

function DatesLine({
  revealed,
  compact,
}: {
  revealed: boolean;
  compact: boolean;
}) {
  const masked = cfg.reveal.masked;
  const idle: DayUnit[] = cfg.reveal.days.map(() => ({
    day: masked.day,
    month: masked.month,
  }));
  const [units, setUnits] = useState<DayUnit[]>(idle);

  useEffect(() => {
    if (revealed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    let frame = 0;
    const total = idle.length * (masked.day.length + masked.month.length);
    const scramble = () => {
      let step = 0;
      const run = () => {
        step++;
        const settle = Math.max(0, step - 12); // flicker ~12 frames, then settle left to right
        let k = 0;
        setUnits(
          idle.map(() => {
            const day = masked.day
              .split("")
              .map(() =>
                k++ < settle ? "X" : String(Math.floor(Math.random() * 10)),
              )
              .join("");
            const month = masked.month
              .split("")
              .map(() =>
                k++ < settle ? "X" : LETTERS[Math.floor(Math.random() * 26)],
              )
              .join("");
            return { day, month };
          }),
        );
        if (step < 12 + total) frame = window.setTimeout(run, 55);
        else setUnits(idle);
      };
      run();
    };
    timer = window.setInterval(scramble, 4200);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(frame);
    };
    // idle is derived from config; masked is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, masked.day, masked.month]);

  const shown: DayUnit[] = revealed
    ? cfg.reveal.days.map((d) => ({ ...d }))
    : units;
  const sep = (
    <span
      className={`countdown-sep font-display leading-none text-gold/60 ${compact ? "text-[36px] px-1" : "text-[60px] px-3"}`}
    >
      ·
    </span>
  );
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        key={revealed ? "revealed" : "masked"}
        className="tick-in flex items-start justify-center"
      >
        {shown.map((u, i) => (
          <span key={i} className="flex items-start">
            {i > 0 && sep}
            <span className="flex flex-col items-center gap-2">
              <span
                className={`countdown-glow font-display font-semibold leading-none text-gold tabular-nums ${
                  compact ? "text-[44px]" : "text-[72px]"
                }`}
              >
                {u.day}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-parchment/55">
                {u.month}
              </span>
            </span>
          </span>
        ))}
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-parchment/60">
        {revealed
          ? `${cfg.reveal.year} · ${cfg.reveal.venue}`
          : `Three days · ${cfg.reveal.year}`}
      </p>
    </div>
  );
}

/** Live countdown to the fest. While unrevealed it shows a glitching, scrambled signal instead of the real numbers. */
function Countdown({
  compact,
  revealed,
}: {
  compact: boolean;
  revealed: boolean;
}) {
  const parts = useCountdown(cfg.reveal.festStart);
  const scrambled = useScrambledUnits();
  if (revealed && parts === null) return null; // fest started
  const glitch = !revealed;
  const v = glitch
    ? scrambled
    : parts === "pending"
      ? { d: "--", h: "--", m: "--", s: "--" }
      : {
          d: pad((parts as Exclude<Parts, null>).d),
          h: pad((parts as Exclude<Parts, null>).h),
          m: pad((parts as Exclude<Parts, null>).m),
          s: pad((parts as Exclude<Parts, null>).s),
        };
  const sep = (
    <span
      className={`countdown-sep font-display leading-none text-gold/60 ${compact ? "text-[36px] px-1" : "text-[60px] px-2"}`}
    >
      :
    </span>
  );
  return (
    <div
      className={`relative flex items-start justify-center ${glitch ? "glitch-field" : ""}`}
    >
      <Unit value={v.d} label="Days" compact={compact} glitch={glitch} />
      {sep}
      <Unit value={v.h} label="Hours" compact={compact} glitch={glitch} />
      {sep}
      <Unit value={v.m} label="Minutes" compact={compact} glitch={glitch} />
      {sep}
      <Unit value={v.s} label="Seconds" compact={compact} glitch={glitch} />
    </div>
  );
}

export function DatesSection({
  opacity,
  emerge,
  rect,
  bounds,
  compact = false,
  scale,
}: SectionProps) {
  const c = cfg.text.dates;
  const revealed = cfg.reveal.revealed;
  return (
    <Overlay
      opacity={opacity}
      emerge={emerge}
      rect={rect}
      bounds={bounds}
      scale={scale}
      align={c.align}
      compact={compact}
    >
      <div
        className={`flex w-full flex-col items-center ${compact ? "gap-3" : "gap-5"}`}
      >
        <Eyebrow>Save the dates</Eyebrow>
        <Title compact={compact}>
          The eclipse
          <br />
          <em className="font-nasyhama font-normal italic text-gold">
            is coming.
          </em>
        </Title>
        <Ornament compact={compact} />
      </div>

      <DatesLine revealed={revealed} compact={compact} />

      <div className="flex flex-col items-center gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-parchment/45">
          {revealed ? "The Action begins in" : "The Action begins in · signal encrypted"}
        </p>
        <Countdown compact={compact} revealed={revealed} />
      </div>

      {/* Shimmering gold rule: the light travelling along the corona */}
      <div className="shimmer-rule h-px w-full" aria-hidden />

      <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-parchment/50">
        Heritage Institute of Technology · Kolkata
      </p>
    </Overlay>
  );
}

// ---------- finale: closing line ----------

export function FinaleSection({
  opacity,
  emerge,
  rect,
  bounds,
  compact,
  scale,
}: SectionProps) {
  const c = cfg.text.finale;
  return (
    <Overlay
      opacity={opacity}
      emerge={emerge}
      rect={rect}
      bounds={bounds}
      scale={scale}
      align={c.align}
      compact={compact}
    >
      <div
        className={`flex w-full flex-col items-center ${compact ? "gap-3" : "gap-4"}`}
      >
        <Eyebrow>Eclecia&rsquo;27</Eyebrow>
        <h2
          className={`font-display font-semibold leading-tight tracking-[-0.015em] text-parchment ${
            compact
              ? "text-[clamp(20px,6.4vw,24px)] text-balance px-2"
              : "text-[48px] whitespace-nowrap"
          }`}
        >
          Uniting talent,{" "}
          <em className="font-nasyhama font-normal italic text-gold">
            igniting culture.
          </em>
        </h2>
        <Ornament compact={compact} />
        <div className="mt-4 flex items-center justify-center">
          <GoldButton href="/register" size={compact ? "sm" : "md"}>
            Join Us
          </GoldButton>
        </div>
      </div>
    </Overlay>
  );
}

/** Dusk: short "what is Eclecia" block under the centred eclipse. */
export function DuskSection({
  opacity,
  emerge,
  rect,
  bounds,
  compact,
  scale,
}: SectionProps) {
  const c = cfg.text.dusk;
  return (
    <Overlay
      opacity={opacity}
      emerge={emerge}
      rect={rect}
      bounds={bounds}
      scale={scale}
      align={c.align}
      scrim={c.scrim}
      compact={compact}
    >
      <div
        className={`flex w-full flex-col items-center text-center ${compact ? "gap-3" : "gap-4"}`}
      >
        {/* <Eyebrow>About the fest</Eyebrow> */}
        <h2
          className={`font-display font-semibold leading-tight tracking-[-0.015em] text-parchment ${
            compact ? "text-[26px]" : "text-[44px]"
          }`}
        >
          Three days.{" "}
          <em className="font-nasyhama font-normal italic text-gold">
            One stage.
          </em>
        </h2>
        <h2
          className={`font-display font-semibold leading-tight tracking-[-0.015em] text-parchment ${
            compact ? "text-[26px]" : "text-[44px]"
          }`}
        >
          The Storm Returns.{" "}
          <em className="font-nasyhama font-normal italic text-gold">
            Reclaim the Throne.
          </em>
        </h2>
        <p
          className={`max-w-[46ch] leading-relaxed text-parchment/75 ${
            compact ? "text-[14px]" : "text-[17px]"
          }`}
        >
          Eclecia is the annual cultural fest of Heritage Institute of
          Technology, Kolkata: music, dance, drama, art and a whole lot more.
        </p>
      </div>
    </Overlay>
  );
}
