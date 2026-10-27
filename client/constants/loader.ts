/**
 * Opening loader. Three looks share one 3 s timeline:
 *   0 → buildMs   the variant's intro plays (CSS keyframes, starts at first paint)
 *   buildMs →     exit plays once the page has loaded (or maxWaitMs passes)
 *
 * Preview any variant with `?loader=eclipse|curtain|yantra` (or 1|2|3);
 * the query also forces the loader even if it already played this session.
 */
export const LOADER_VARIANTS = ["eclipse", "curtain", "yantra"] as const;
export type LoaderVariant = (typeof LOADER_VARIANTS)[number];

export const LOADER = {
  /** Variant shown to visitors. */
  variant: "eclipse" as LoaderVariant,
  /** Intro length; keyframes in styles/loader.css are authored against this. */
  buildMs: 2400,
  /** Exit animation length. */
  exitMs: 600,
  /** Never hold the curtain longer than this, loaded or not. */
  maxWaitMs: 4500,
  /** Play once per tab session (hard reloads in the same tab skip it). */
  oncePerSession: true,
  storageKey: "eclecia-loader-seen",
} as const;
