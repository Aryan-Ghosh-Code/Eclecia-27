// Single place to tune the scroll-driven scene.
//
// Coordinates are in the 1512x864 Figma frame. For every asset in every
// section you set where its CENTRE sits (x, y), how wide it renders (w, px;
// height keeps the image's aspect), plus optional rotate (deg) and opacity.
// Anything between two sections is interpolated automatically.

/** Resting pose of one asset in one section. */
export type Pose = {
  x: number;
  y: number;
  w: number;
  rotate?: number;
  opacity?: number;
  /** Mirror horizontally / vertically. Animates as a flip when it changes between sections. */
  flipX?: boolean;
  flipY?: boolean;
};

export type AssetId =
  | "bg"
  | "rays"
  | "moon"
  | "minisun"
  | "suncover"
  | "mainart"
  | "bottom"
  // Indian-art ornaments (see LAYERS in page.tsx for sources)
  | "veena"
  | "hand"
  | "bannerL"
  | "bannerR";

export type Arc = "up" | "down" | "none";

export type SectionLayout = {
  /** Track-progress window during which the section holds these poses. */
  hold: readonly [number, number];
  /** Shape of the moon's path while travelling INTO this section: bow upward, downward, or straight. */
  arrive: Arc;
} & Record<AssetId, Pose>;

const FRAME_W = 1512;
const FRAME_H = 864;

export const sceneConfig = {
  frame: { width: FRAME_W, height: FRAME_H },

  /** Length of the pinned scroll track, in viewport heights. Lower = less scrolling per section. */
  scrollVh: 6.5,

  /**
   * Inertia: how much of the remaining distance the scene covers per frame
   * while catching up with the scrollbar (0 = snap, 0.1 = glide, 0.25 = tight).
   */
  scrollSmoothing: 0.11,

  /** How far (px) the moon bows off the straight line mid-travel; direction per section via `arrive`. */
  orbitArcPx: 110,

  /** ---- End states per section. Edit these. ---- */
  layout: {
    hero: {
      hold: [0, 0.14],
      arrive: "none",
      bg: { x: 756, y: 432, w: 1512 },
      rays: { x: 774, y: 254, w: 432 },
      moon: { x: 773.5, y: 251.5, w: 437, rotate: 0 },
      minisun: { x: 773.5, y: 285.5, w: 133 },
      suncover: { x: 671, y: 348.5, w: 1672, rotate: 0 },
      mainart: { x: 760, y: 450, w: 1520 },
      bottom: { x: 676, y: 1431, w: 1672 }, // waiting below the frame
      // ornaments
      veena: { x: 1160, y: 1450, w: 820, rotate: -6, flipX: true },
      hand: { x: -390, y: 1300, w: 260, rotate: 15 },
      bannerL: { x: 270, y: -520, w: 300 },
      bannerR: { x: 1242, y: -520, w: 300, flipX: true },
    },
    dates: {
      hold: [0.3, 0.46],
      arrive: "down",
      bg: { x: 768, y: 424, w: 1603 },
      rays: { x: 50, y: 440, w: 821 },
      moon: { x: 50, y: 440, w: 830, rotate: -100 },
      minisun: { x: 773.5, y: 9903, w: 133 }, // below the frame
      suncover: { x: -2349, y: 1348, w: 1672, rotate: -8 }, // swept off bottom-left
      mainart: { x: 676, y: 1531, w: 1672 }, // dropped off the bottom
      bottom: { x: 676, y: 1431, w: 1672 },
      // ornaments
      veena: { x: 1090, y: 655, w: 720, rotate: 0, flipX: true },
      hand: { x: -90, y: 500, w: 260, rotate: 15 },
      bannerL: { x: 270, y: -520, w: 300 },
      bannerR: { x: 1242, y: -520, w: 300, flipX: true },
    },
    stats: {
      hold: [0.62, 0.78],
      arrive: "up",
      bg: { x: 745, y: 424, w: 1603 },
      rays: { x: 1465, y: 460, w: 734 },
      moon: { x: 1465, y: 460, w: 743, rotate: 100 },
      minisun: { x: 773.5, y: 1003, w: 133 },
      suncover: { x: -629, y: 1248, w: 1672, rotate: -8 },
      mainart: { x: 676, y: 1531, w: 1672 },
      bottom: { x: 676, y: 1431, w: 1672 },
      // ornaments
      veena: { x: 1950, y: 1100, w: 820, rotate: -6, flipX: true },
      hand: { x: 180, y: 225, w: 310, rotate: 15 },
      bannerL: { x: 270, y: -520, w: 300 },
      bannerR: { x: 1242, y: -520, w: 300, flipX: true },
    },
    // Dusk: moon comes to the centre and shrinks, sky still empty.
    dusk: {
      hold: [0.86, 0.9],
      arrive: "none",
      bg: { x: 756, y: 432, w: 1603 },
      rays: { x: 756, y: 330, w: 375 },
      moon: { x: 756, y: 330, w: 380, rotate: -100 },
      minisun: { x: 773.5, y: 1003, w: 133 },
      suncover: { x: -629, y: 1248, w: 1672, rotate: -8 },
      mainart: { x: 676, y: 1531, w: 1672 },
      bottom: { x: 676, y: 1431, w: 1672 },
      // ornaments
      veena: { x: 1950, y: 1100, w: 820, rotate: -6 },
      hand: { x: -320, y: 100, w: 260, rotate: 15 },
      bannerL: { x: 270, y: 400, w: 300 },
      bannerR: { x: 1242, y: 400, w: 300, flipX: true },
    },
    // Finale: the landscape rises in front while the eclipse sinks behind the
    // hills, like a setting sun. `bottom` paints above the moon layers.
    finale: {
      hold: [1, 1],
      arrive: "none",
      bg: { x: 757, y: 438, w: 1603 },
      rays: { x: 756, y: 560, w: 375 },
      moon: { x: 756, y: 560, w: 380, rotate: -200 },
      minisun: { x: 773.5, y: 1003, w: 133 },
      suncover: { x: -629, y: 1248, w: 1672, rotate: -8 },
      mainart: { x: 676, y: 1531, w: 1672 },
      bottom: { x: 676, y: 431.5, w: 1672 }, // in place (same rect as the hero art)
      // ornaments
      veena: { x: 1950, y: 1100, w: 820, rotate: -6 },
      hand: { x: 90, y: 1300, w: 260, rotate: 15 },
      bannerL: { x: 270, y: -520, w: 300 },
      bannerR: { x: 1242, y: -520, w: 300, flipX: true },
    },
  } satisfies Record<string, SectionLayout>,

  /**
   * ---- Mobile / portrait overrides ----
   * Active when `mobileQuery` matches. Any asset pose listed here replaces the
   * desktop one for that section; everything else falls back to `layout`.
   * The frame is still cover-scaled, so on a phone only the middle ~400 frame
   * px are visible: keep x near 756.
   */
  mobileQuery: "(max-width: 820px), (orientation: portrait)",

  /**
   * Tablet tier: matched BEFORE mobileQuery. Uses the landscape hero art with
   * the poses in `layoutTablet`; anything not listed there falls back to
   * `layoutMobile`, then `layout`. Text panels behave like mobile.
   */
  tabletQuery:
    "(min-width: 600px) and (max-width: 1100px) and (min-aspect-ratio: 4/5)",
  layoutTablet: {
    hero: {
      // Landscape art, pulled in and centred so both figures stay in the visible band.
      mainart: { x: 820, y: 445, w: 1440 },
      suncover: { x: 700, y: 348.5, w: 1440, rotate: 0 },
      rays: { x: 774, y: 254, w: 500 },
      moon: { x: 773.5, y: 251.5, w: 505, rotate: 0 },
      minisun: { x: 773.5, y: 283, w: 123 },
    },
    // Landscape tablets are short: moon tucks up under the header, text below.
    stats: {
      rays: { x: 756, y: 180, w: 325 },
      moon: { x: 756, y: 180, w: 325, rotate: 50 },
    },
    dates: {
      suncover: { x: -1000, y: 1000.5, w: 1440, rotate: 0 },
      rays: { x: 756, y: 200, w: 396 },
      moon: { x: 756, y: 200, w: 400, rotate: -40 },
    },
    dusk: {
      rays: { x: 756, y: 300, w: 300 },
      moon: { x: 756, y: 300, w: 300, rotate: 90 },
      bannerL: { x: 500, y: 300, w: 240 },
      bannerR: { x: 1012, y: 300, w: 240, flipX: true },
    },
    finale: {
      bannerL: { x: 540, y: -520, w: 240 },
      bannerR: { x: 972, y: -520, w: 240, flipX: true },
    },
  } satisfies Record<string, Partial<Record<AssetId, Pose>>>,

  /**
   * Portrait tablet tier (iPad / iPad Pro upright): matched before mobileQuery.
   * Keeps the portrait hero art; poses here override `layoutMobile`, the rest
   * fall back to `layoutMobile`, then `layout`. Text panels behave like mobile
   * but use `textTabletPortrait` rects.
   */
  tabletPortraitQuery: "(min-width: 600px) and (orientation: portrait)",
  layoutTabletPortrait: {
    stats: {
      rays: { x: 756, y: 150, w: 196 },
      moon: { x: 756, y: 150, w: 200, rotate: 50 },
      bannerL: { x: 570, y: -520, w: 230 },
      bannerR: { x: 942, y: -520, w: 230, flipX: true },
    },
    dates: {
      rays: { x: 756, y: 150, w: 206 },
      moon: { x: 756, y: 150, w: 210, rotate: -40 },
    },
    dusk: {
      rays: { x: 756, y: 330, w: 256 },
      moon: { x: 756, y: 330, w: 260, rotate: 90 },
      bannerL: { x: 570, y: 330, w: 230 },
      bannerR: { x: 942, y: 330, w: 230, flipX: true },
    },
    finale: {
      bannerL: { x: 570, y: -520, w: 230 },
      bannerR: { x: 942, y: -520, w: 230, flipX: true },
    },
  } satisfies Record<string, Partial<Record<AssetId, Pose>>>,
  layoutMobile: {
    hero: {
      // Portrait hero art: bottom-pinned so decorative border always touches screen bottom.
      // Frame height = 864px, image height = 1672px, layer.y = -39 → centre = -39 + 1672/2 = 797
      mainart: { x: 756, y: 500, w: 490 },
      // Eclipse sits in that top sky band.
      rays: { x: 756, y: 115, w: 208 },
      moon: { x: 756, y: 115, w: 210, rotate: 0 },
      minisun: { x: 756, y: 130, w: 64 },
      suncover: { x: 671, y: -1400, w: 1672, rotate: 0 },
    },
    stats: {
      mainart: { x: 756, y: 1750, w: 486 },
      minisun: { x: 756, y: 1100, w: 76 },
      suncover: { x: 671, y: -1400, w: 1672, rotate: 0 },
      rays: { x: 756, y: 205, w: 256 },
      moon: { x: 756, y: 205, w: 260, rotate: 50 },
      hand: { x: 90, y: 1300, w: 260, rotate: 15 },
      // Banners wait straight above their dusk slots so they drop in vertically.
      bannerL: { x: 610, y: -520, w: 180 },
      bannerR: { x: 902, y: -520, w: 180, flipX: true },
    },
    dates: {
      mainart: { x: 756, y: 1750, w: 820 }, // dropped off the bottom
      minisun: { x: 756, y: 1100, w: 76 },
      suncover: { x: 671, y: -1400, w: 1672, rotate: 0 },
      rays: { x: 756, y: 250, w: 296 },
      moon: { x: 756, y: 250, w: 300, rotate: -40 },
      veena: { x: 1160, y: 1450, w: 820, rotate: -6 },
    },
    dusk: {
      mainart: { x: 756, y: 1750, w: 486 },
      minisun: { x: 756, y: 1100, w: 76 },
      suncover: { x: 671, y: -1400, w: 1672, rotate: 0 },
      // Moon shrinks a touch so the two banners fit beside it inside the
      // ~400 frame px visible on a phone (x ≈ 556..956).
      rays: { x: 756, y: 330, w: 196 },
      moon: { x: 756, y: 330, w: 200, rotate: 90 },
      bannerL: { x: 610, y: 330, w: 180 },
      bannerR: { x: 902, y: 330, w: 180, flipX: true },
    },
    finale: {
      mainart: { x: 756, y: 1750, w: 486 },
      minisun: { x: 756, y: 1100, w: 76 },
      suncover: { x: 671, y: -1400, w: 1672, rotate: 0 },
      rays: { x: 756, y: 560, w: 276 },
      moon: { x: 756, y: 560, w: 280, rotate: 110 },
      // Banners lift straight back out of view.
      bannerL: { x: 610, y: -520, w: 180 },
      bannerR: { x: 902, y: -520, w: 180, flipX: true },
    },
  } satisfies Record<string, Partial<Record<AssetId, Pose>>>,

  /**
   * Mobile text panels are positioned in VIEWPORT fractions (x = left edge,
   * y = vertical centre, w = width), not frame px, so they always fit the
   * screen. They still emerge from the moon.
   */
  /** Tablet overrides for text panels (viewport fractions); missing keys use textMobile. */
  textTablet: {
    hero: { x: 0.1, y: 0.74, w: 0.8 },
    stats: { x: 0.1, y: 0.62, w: 0.8 },
    dates: { x: 0.1, y: 0.63, w: 0.8 },
    dusk: { x: 0.1, y: 0.72, w: 0.8 },
  },
  /** Portrait-tablet overrides for text panels; missing keys use textMobile. */
  textTabletPortrait: {
    stats: { x: 0.08, y: 0.7, w: 0.84 },
    dates: { x: 0.08, y: 0.7, w: 0.84 },
    dusk: { x: 0.08, y: 0.72, w: 0.84 },
  },
  /**
   * Text panels on tablets render at phone markup but scaled up so the type
   * is not toy-sized: scale = clamp(1, min(w / 520, h / 720), max).
   */
  panelScaleMax: 1.5,

  textMobile: {
    hero: { x: 0.05, y: 0.76, w: 0.9 },
    stats: { x: 0.06, y: 0.58, w: 0.88 },
    dates: { x: 0.05, y: 0.58, w: 0.9 },
    dusk: { x: 0.06, y: 0.7, w: 0.88 },
    finale: { x: 0.06, y: 0.26, w: 0.88 },
  },

  /** ---- Text overlays (fixed) ---- */
  /**
   * Text panels live in frame coords and sit UNDER the moon layers. During
   * `fadeIn` each panel slides out from behind the moon's current centre to
   * its `rect` (x = left edge, y = vertical centre, w = width), so the moon
   * uncovers it as it travels. `align` = "left" | "center" | "right".
   */
  text: {
    /** Hero wordmark: visible from the top, fades as the art clears. Paints above the art. */
    hero: {
      fadeIn: [-1, 0],
      fadeOut: [0.04, 0.13],
      rect: { x: 356, y: 640, w: 800 },
      align: "center",
      scrim: { opacity: 0.7, bleedPx: 160 },
      z: 90,
    },
    stats: {
      fadeIn: [0.49, 0.62],
      fadeOut: [0.79, 0.85],
      rect: { x: 300, y: 440, w: 760 }, // left of the moon
      scrim: { opacity: 0, bleedPx: 0 }, // no halo here
      align: "center",
    },
    dates: {
      fadeIn: [0.17, 0.3],
      fadeOut: [0.43, 0.49],
      rect: { x: 590, y: 440, w: 820 }, // right of the moon
      align: "center",
    },
    /** Dusk: two quiet lines under the centred eclipse, between the banners. */
    dusk: {
      fadeIn: [0.82, 0.87],
      fadeOut: [0.9, 0.94],
      rect: { x: 406, y: 660, w: 700 }, // below the moon (y 330, w 380)
      align: "center",
      scrim: { opacity: 0, bleedPx: 0 },
    },
    /** Closing line above the setting eclipse. Never fades out. */
    finale: {
      fadeIn: [0.9, 1],
      fadeOut: [2, 3],
      rect: { x: 206, y: 160, w: 1100 },
      align: "center",
      z: 90,
    },
  },
  /** Panel scale at the start of its slide-out (1 = no growth). */
  textEmergeScale: 0.7,
  /**
   * Legibility over busy art: a soft dark halo behind each text panel
   * (0 = off, 1 = solid) and how far it bleeds past the panel edge (px).
   * Default for all panels; override per panel with `text.<name>.scrim`.
   * `text.<name>.z` overrides a panel's paint order (default 15, under the moon).
   */
  textScrim: { opacity: 0.66, bleedPx: 140 },

  /**
   * Date reveal. Countdown runs to `festStart`; after that the section shows
   * `days`. Dates are 15-17 January 2027.
   */
  reveal: {
    /** Flip with NEXT_PUBLIC_DATES_REVEALED=true. */
    revealed: process.env.NEXT_PUBLIC_DATES_REVEALED === "true",
    /** The fest itself starts here; the countdown runs to it. */
    festStart: "2027-01-15T10:00:00+05:30",
    /** Shown once revealed: big day on top, month below, like the timer units. */
    days: [
      { day: "15", month: "January" },
      { day: "16", month: "January" },
      { day: "17", month: "January" },
    ],
    /** While hidden every unit shows this; the slots scramble now and then. */
    masked: { day: "XX", month: "XXX" },
    year: "2027",
    venue: "Heritage Institute of Technology, Kolkata",
  },

  /** Site header fades in as the hero art clears and stays for the rest of the page. */
  header: { fadeIn: [0.2, 0.28] },

  /**
   * Section snapping. After input stops for `idleMs`, the page eases to the
   * next section in the direction you were scrolling (or back to the one you
   * barely left, within `deadZone` of track progress). Fast continuous
   * scrolling never triggers it, so you can fly from first to last.
   */
  snap: {
    enabled: true,
    idleMs: 190,
    minMs: 320,
    maxMs: 620,
    deadZone: 0.05,
  },

  /** /sponsors page: which section's poses the eclipse copies (needs the left-moon one). */
  sponsorsPoseFrom: "dates" as "dates" | "stats",
  /** /sponsors page: eclipse turns this many degrees per px scrolled. */
  sponsorsSpinDegPerPx: 0.05,

  /** Scroll targets for header nav, as track fractions. */
  navTargets: { dates: 0.38, stats: 0.7 },
} as const;

export type SectionName = keyof typeof sceneConfig.layout;
