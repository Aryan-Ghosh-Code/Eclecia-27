/**
 * Opening loader (eclipse totality), one 3 s timeline:
 *   0 → buildMs   the intro plays (CSS keyframes, starts at first paint)
 *   buildMs →     exit plays once the page has loaded (or maxWaitMs passes)
 *
 * Add `?loader` to the URL to replay it even if it already played this session.
 */
export const LOADER = {
  /** Intro length; keyframes in styles/loader.css are authored against this. */
  buildMs: 2400,
  /** Exit animation length. */
  exitMs: 600,
  /** Never hold the loader longer than this, loaded or not. */
  maxWaitMs: 4500,
  /** Play once per tab session (hard reloads in the same tab skip it). */
  oncePerSession: true,
  storageKey: "eclecia-loader-seen",
} as const;
