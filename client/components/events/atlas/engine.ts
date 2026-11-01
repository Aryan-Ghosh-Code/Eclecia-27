import { atlasArt, type AtlasCategory } from "@/constants/events";
import { clearAtlasSpot, readAtlasSpot } from "./atlas-spot";
import { SolarSystem, type OrbitPoint } from "./solar-system";

/*
 * Events atlas runtime: the category orbit, the zoom into a category's world of
 * event planets, and the directory dialog. Imperative by design — one
 * requestAnimationFrame loop and native Web Animations, no per-frame React
 * renders. Atlas wheel/drag input rotates the orbit; event mode keeps native
 * page scrolling as the camera.
 *
 * Ported from design/events-atlas/poc (app.js). `mountAtlas` returns a cleanup
 * that removes every listener, timer, animation and generated node, so it is
 * safe under React strict-mode double mounting.
 */

type Mode = "atlas" | "events";

const ORBIT_STEP = (Math.PI * 2) / 7;
const ORBIT_ANGLES = [
  (-Math.PI * 3) / 7, Math.PI, -Math.PI / 7, Math.PI / 7, (Math.PI * 3) / 7, (Math.PI * 5) / 7, (-Math.PI * 5) / 7,
];
const EASE = "cubic-bezier(.76,0,.24,1)";
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export interface AtlasOptions {
  categories: AtlasCategory[];
  onDiscover: (categoryId: string, eventId: string) => void;
}

export function mountAtlas(root: HTMLElement, { categories: data, onDiscover }: AtlasOptions): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const on = <T extends Event>(
    target: EventTarget,
    type: string,
    handler: (event: T) => void,
    options: AddEventListenerOptions = {},
  ) => target.addEventListener(type, handler as EventListener, { ...options, signal });

  const $ = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector<T>(`#${id}`)!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = () => innerWidth <= 760;

  let mode: Mode = "atlas";
  let busy = false;
  let disposed = false;
  let category: AtlasCategory | null = null;
  let active = -1;
  let progress = 0;
  let planets: HTMLButtonElement[] = [];
  const categoryButtons: HTMLButtonElement[] = [];
  let pointerX = 0, pointerY = 0, skyX = 0, skyY = 0;
  let directoryFilter = "all";
  let previousTime = 0;
  let focusedWorld: HTMLButtonElement | null = null;
  let modalScroll = 0;
  let orbitRotation = 0, orbitTarget = 0, orbitVelocity = 0, blockOrbitClickUntil = 0;
  let orbitGesture: { id: number; x: number; y: number; rotation: number; last: number; time: number; moved: boolean } | null = null;
  let orbitReady = false;
  let frontCategory = "";
  let frontWorld: AtlasCategory | null = null;
  let wheelSnap = 0, loadTimeout = 0, rafId = 0;
  let floatClock = 0;
  let traveling = false;
  /** Opening sequence in flight: input waits, and the orbit spin is driven by `introSpin`. */
  let introPlaying = false;
  let introSpin: { start: number; duration: number; from: number; to: number } | null = null;
  /** Rotation that seats a random world in front, so each visit opens on a different one. */
  const introSeat = (() => {
    const a = Math.PI - ORBIT_ANGLES[Math.floor(Math.random() * ORBIT_ANGLES.length)];
    return Math.atan2(Math.sin(a), Math.cos(a));
  })();
  let introAnimations: Animation[] = [];

  const camera = $("atlas-camera");
  const overview = $("overview");
  const scene = $("event-scene");
  const directory = $<HTMLDialogElement>("directory");
  const loadStatus = $("load-status");
  const skyTexture = root.querySelector<HTMLElement>(".sky-texture")!;
  const dust = root.querySelector<HTMLElement>(".dust")!;
  const failedImages = new Set<string>();
  root.dataset.mode = mode;

  let solar: SolarSystem | null = null;
  try {
    solar = new SolarSystem(camera, data);
  } catch (error) {
    console.error("Atlas projection unavailable", error);
    loadStatus.textContent = "The atlas could not load. All events remain available in the directory.";
    loadStatus.hidden = false;
  }

  function image(src: string, className: string, priority = false) {
    const img = new Image();
    img.src = src;
    img.alt = "";
    img.className = className;
    img.decoding = "async";
    img.draggable = false;
    if (priority) img.fetchPriority = "high";
    let retry = 0;
    on(img, "load", () => {
      if (failedImages.delete(src) && failedImages.size === 0) loadStatus.hidden = true;
    });
    on(img, "error", () => {
      if (retry++ < 1) {
        img.src = `${src}?reload=${Date.now()}`;
        return;
      }
      failedImages.add(src);
      loadStatus.textContent = "An illustration could not load. Refresh to try again.";
      loadStatus.hidden = false;
    });
    return img;
  }

  function animate(el: Element, frames: Keyframe[], duration = 850, options: KeyframeAnimationOptions = {}) {
    const animation = el.animate(frames, { duration: reduce.matches ? 1 : duration, easing: EASE, fill: "forwards", ...options });
    return animation.finished.catch(() => {}).then(() => animation);
  }
  const cancelAnimations = (el: Element | null | undefined) => el?.getAnimations?.().forEach((a) => a.cancel());

  function fadeCopy() {
    const copy = $("event-copy");
    cancelAnimations(copy);
    copy.animate([{ opacity: 0, translate: "0 15px" }, { opacity: 1, translate: "0 0" }], {
      duration: reduce.matches ? 1 : 470,
      easing: "cubic-bezier(.22,1,.36,1)",
    });
  }

  function worldGraphic(c: AtlasCategory) {
    const graphic = document.createElement("span");
    graphic.className = "world-art";
    graphic.append(
      image(atlasArt.shared("corona-halo"), "world-halo"),
      image(atlasArt.shared("medallion-base"), "world-base"),
      image(atlasArt.category(c.id), "world-artwork", true),
    );
    // Eclipse lighting, clipped to the medallion disc.
    const shade = document.createElement("span");
    shade.className = "world-shade";
    const rim = document.createElement("span");
    rim.className = "world-rim";
    graphic.append(shade, rim);
    return graphic;
  }

  // One caption, pinned to the fixed front slot; it names whichever world
  // sits there and fades out as worlds pass through mid-turn.
  const frontCaption = document.createElement("button");
  frontCaption.id = "front-caption";
  frontCaption.tabIndex = -1;
  frontCaption.setAttribute("aria-hidden", "true");
  frontCaption.innerHTML =
    '<span class="category-name"></span><div class="category-meta-row"><span class="category-kind"></span><span class="category-meta-dot">·</span><span class="category-count"></span></div><span class="world-enter">ENTER WORLD ↗</span>';
  on(frontCaption, "click", () => {
    if (performance.now() >= blockOrbitClickUntil && frontWorld) enterCategory(frontWorld);
  });

  data.forEach((c, i) => {
    const button = document.createElement("button");
    button.className = "category-world";
    button.dataset.category = c.id;
    button.style.setProperty("--i", String(i));
    button.setAttribute("aria-label", `Enter ${c.name}, ${c.kind}, ${c.events.length} events`);
    const shadow = document.createElement("span");
    shadow.className = "world-shadow";
    button.append(shadow, worldGraphic(c));
    on<MouseEvent>(button, "click", (e) => {
      if (performance.now() < blockOrbitClickUntil) {
        e.preventDefault();
        return;
      }
      enterCategory(c);
    });
    $("category-worlds").append(button);
    categoryButtons.push(button);

    const dock = document.createElement("button");
    dock.className = "dock-world";
    dock.title = c.name;
    dock.setAttribute("aria-label", `Enter ${c.name}`);
    const caption = document.createElement("span");
    caption.textContent = c.name;
    dock.append(image(atlasArt.category(c.id), ""), caption);
    on(dock, "click", () => switchCategory(c));
    $("category-dock").append(dock);
  });
  $("category-worlds").append(frontCaption);

  const step = () => innerHeight * (mobile() ? 1.06 : 1.12);
  const planetSize = () =>
    mobile() ? Math.min(innerWidth * 0.78, innerHeight * 0.44) : Math.min(innerWidth * 0.47, innerHeight * 0.76, 730);

  function layout() {
    // A hidden or collapsing viewport can report 0 × 0; projecting with it
    // yields NaN geometry, so keep the last good layout until it is real.
    if (!innerWidth || !innerHeight) return;
    solar?.resize(innerWidth, innerHeight);
    orbitReady = true;
    renderOrbit();
    if (category) {
      $("scroll-track").style.height = mode === "events" ? `${innerHeight + (category.events.length - 1) * step()}px` : "0px";
      root.style.setProperty("--planet-size", `${planetSize()}px`);
    }
    renderPlanets();
  }

  function renderOrbit() {
    if (!orbitReady) return;
    const small = mobile();
    const points: OrbitPoint[] | undefined = solar?.update(orbitRotation, ORBIT_ANGLES);
    const sun = solar?.sun ?? { x: innerWidth * 0.6, y: innerHeight * 0.5 };
    let front = 0;
    let frontDepth = Infinity;
    categoryButtons.forEach((button, i) => {
      const p = points?.[i] ?? { x: innerWidth * (0.13 + i * 0.12), y: innerHeight * 0.6, size: innerWidth * 0.1, depth: 30, frontness: 1, turn: 0 };
      const f = p.frontness;
      const back = 1 - f;
      const s = button.style;
      s.setProperty("--size", `${p.size}px`);
      s.setProperty("--x", `${p.x}px`);
      s.setProperty("--y", `${p.y}px`);
      s.setProperty("--turn", `${p.turn.toFixed(4)}rad`);
      // Light falls from the eclipse: a warm rim on the sun-facing edge and
      // shade on the far side; rear worlds are backlit and sink into haze.
      s.setProperty("--sun-angle", `${Math.atan2(sun.x - p.x, p.y - sun.y).toFixed(4)}rad`);
      s.setProperty("--shade", (0.3 + back * 0.3).toFixed(3));
      s.setProperty("--rim", (0.5 + back * 0.3).toFixed(3));
      s.setProperty("--halo", (0.12 + back * back * 0.5).toFixed(3));
      s.setProperty("--contact", (0.2 + f * 0.55).toFixed(3));
      s.setProperty(
        "--haze",
        `blur(${(back * back * (small ? 0.3 : 0.55)).toFixed(2)}px) brightness(${(0.7 + 0.3 * Math.pow(f, 0.7)).toFixed(3)}) saturate(${(0.82 + 0.18 * f).toFixed(3)})`,
      );
      // The sun sits between the rear and front orbital hemispheres.
      s.zIndex = String((f < 0.5 ? 20 : 60) + Math.round(f * 20));
      if (p.depth < frontDepth) {
        frontDepth = p.depth;
        front = i;
      }
    });
    if (frontCategory !== data[front].name) {
      frontCategory = data[front].name;
      frontWorld = data[front];
      frontCaption.querySelector(".category-name")!.textContent = frontWorld.name;
      const kindEl = frontCaption.querySelector(".category-kind");
      const countEl = frontCaption.querySelector(".category-count");
      if (kindEl) kindEl.textContent = frontWorld.kind;
      if (countEl) countEl.textContent = `${frontWorld.events.length} events`;
    }
    if (solar) {
      const slot = solar.frontSlot();
      // Fully visible when a world is seated; zero exactly at mid-turn.
      const offset = Math.abs(
        Math.atan2(Math.sin(Math.PI - ORBIT_ANGLES[front] - orbitRotation), Math.cos(Math.PI - ORBIT_ANGLES[front] - orbitRotation)),
      );
      frontCaption.style.setProperty("--x", `${slot.x}px`);
      const targetY = slot.y + slot.size * 0.5 + (small ? 4 : 8);
      const safeY = Math.min(targetY, innerHeight - 68);
      frontCaption.style.setProperty("--y", `${safeY}px`);
      frontCaption.style.opacity = clamp(1 - offset / (ORBIT_STEP * 0.42), 0, 1).toFixed(3);
      frontCaption.style.pointerEvents = offset < ORBIT_STEP * 0.1 ? "auto" : "none";
    }
  }

  function turnOrbit(direction: number) {
    if (mode !== "atlas" || busy || introPlaying) return;
    orbitTarget += direction * ORBIT_STEP;
  }

  function snapOrbit() {
    let adjustment = Infinity;
    ORBIT_ANGLES.forEach((a) => {
      const delta = Math.atan2(Math.sin(Math.PI - a - orbitTarget), Math.cos(Math.PI - a - orbitTarget));
      if (Math.abs(delta) < Math.abs(adjustment)) adjustment = delta;
    });
    orbitTarget += adjustment;
  }

  on<PointerEvent>(camera, "pointerdown", (e) => {
    if (mode !== "atlas" || busy || introPlaying || e.button !== 0) return;
    orbitGesture = { id: e.pointerId, x: e.clientX, y: e.clientY, rotation: orbitTarget, last: orbitTarget, time: e.timeStamp, moved: false };
    orbitVelocity = 0;
  });
  on<PointerEvent>(camera, "pointermove", (e) => {
    const d = orbitGesture;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) > 7) {
      d.moved = true;
      camera.setPointerCapture(e.pointerId);
      camera.classList.add("is-dragging");
    }
    if (!d.moved) return;
    e.preventDefault();
    const next = d.rotation + (dx - dy * 0.45) / (innerWidth * 0.3);
    const elapsed = Math.max(8, e.timeStamp - d.time) / 16.667;
    orbitVelocity = orbitVelocity * 0.45 + ((next - d.last) / elapsed) * 0.55;
    orbitTarget = next;
    d.last = next;
    d.time = e.timeStamp;
  });
  const finishOrbitGesture = (e: PointerEvent) => {
    if (!orbitGesture || orbitGesture.id !== e.pointerId) return;
    // Release settles the nearest world into the front slot; a flick may
    // carry it at most one world further.
    if (orbitGesture.moved) {
      blockOrbitClickUntil = performance.now() + 350;
      orbitTarget += clamp(orbitVelocity * 6, -ORBIT_STEP * 0.6, ORBIT_STEP * 0.6);
      snapOrbit();
    }
    if (camera.hasPointerCapture(e.pointerId)) camera.releasePointerCapture(e.pointerId);
    orbitGesture = null;
    camera.classList.remove("is-dragging");
  };
  on(camera, "pointerup", finishOrbitGesture);
  on(camera, "pointercancel", finishOrbitGesture);
  on<WheelEvent>(
    camera,
    "wheel",
    (e) => {
      if (mode !== "atlas" || busy || introPlaying) return;
      e.preventDefault();
      orbitTarget += clamp(e.deltaX || e.deltaY, -90, 90) * 0.0028;
      clearTimeout(wheelSnap);
      wheelSnap = window.setTimeout(snapOrbit, 140);
    },
    { passive: false },
  );

  function buildSystem(c: AtlasCategory) {
    category = c;
    active = -1;
    progress = 0;
    planets = [];
    $("planet-system").replaceChildren();
    $("event-progress").replaceChildren();
    $("breadcrumb").textContent = c.name;
    $("world-label").textContent = `THE ${c.name.toUpperCase()} WORLD`;
    $("category-line").textContent = c.line;
    root.style.setProperty("--planet-size", `${planetSize()}px`);
    c.events.forEach((event, i) => {
      const node = document.createElement("button");
      node.className = "event-planet";
      node.setAttribute("aria-label", `View ${event.name}`);
      node.append(
        image(atlasArt.shared("corona-halo"), "planet-halo"),
        image(atlasArt.shared("event-orbit"), "planet-ring rear"),
        image(atlasArt.shared("planet-base"), "planet-base"),
        image(atlasArt.event(c.id, event.id), "planet-artwork", i === 0),
        image(atlasArt.shared("event-orbit"), "planet-ring front"),
      );
      on(node, "click", () => (Math.abs(progress - i) < 0.35 || i === active ? discover() : goTo(i)));
      $("planet-system").append(node);
      planets.push(node);
      const stop = document.createElement("button");
      stop.className = "progress-stop";
      stop.setAttribute("aria-label", `Go to ${event.name}`);
      stop.title = event.name;
      on(stop, "click", () => goTo(i));
      $("event-progress").append(stop);
    });
    [...$("category-dock").children].forEach((b, i) => b.setAttribute("aria-current", String(data[i] === c)));
    updateCopy(0);
    renderPlanets();
  }

  function updateCopy(index: number) {
    if (!category || index === active) return;
    active = index;
    const event = category.events[index];
    $("event-title").textContent = event.name;
    $("event-description").textContent = event.description;
    $("event-kind").textContent = event.kind;
    const clubName = event.club || "";
    $("event-counter").textContent = clubName;
    $("event-counter").style.display = clubName ? "inline-block" : "none";
    $("journey-label").textContent = `${index + 1} OF ${category.events.length}`;
    $<HTMLButtonElement>("previous").disabled = index === 0;
    $<HTMLButtonElement>("next").disabled = index === category.events.length - 1;
    [...$("event-progress").children].forEach((b, i) => b.setAttribute("aria-current", String(i === index)));
    planets.forEach((p, i) => {
      p.classList.toggle("is-current", i === index);
      p.tabIndex = Math.abs(i - index) <= 1 ? 0 : -1;
    });
    fadeCopy();
  }

  function renderPlanets() {
    if (!category) return;
    const w = innerWidth;
    const h = innerHeight;
    const size = planetSize();
    const small = mobile();
    // Viewport fractions: the current world rests at `rest`, the next waits
    // at `wait` (top right), and the one after arrives from `back`, just
    // above the screen, curving round into the wait slot like the far side
    // of an orbit.
    const rest = small ? [0.52, 0.335] : [0.68, 0.515];
    const wait = small ? [0.93, 0.205] : [0.885, 0.215];
    const back = small ? [0.6, -0.1] : [0.7, -0.12];
    // Bezier through the bend: carry on past `wait` the way the world came.
    const bend = [wait[0] + (wait[0] - rest[0]) * 0.5, wait[1] + (wait[1] - rest[1]) * 0.5];
    const curve = (a: number[], q: number[], b: number[], t: number) => [
      (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * q[0] + t * t * b[0],
      (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * q[1] + t * t * b[1],
    ];
    planets.forEach((node, i) => {
      const offset = i - progress;
      let x: number, y: number, scale: number, opacity: number;
      if (offset >= 0) {
        // Incoming: wait slot to rest in a straight glide; beyond the wait
        // slot, round the bend and up out of the top of the screen.
        const [fx, fy] =
          offset <= 1
            ? [wait[0] + (rest[0] - wait[0]) * (1 - offset), wait[1] + (rest[1] - wait[1]) * (1 - offset)]
            : curve(wait, bend, back, Math.min(offset - 1, 1));
        x = w * fx;
        y = h * fy;
        scale = Math.exp(-(small ? 1.28 : 1.09) * offset);
        opacity = Math.pow(0.56, offset);
      } else {
        // Outgoing: leaves along the line it arrived on, then bends to cross
        // the bottom-left corner at full opacity. It ends on the far side of
        // the corner, clear of the screen out to the ring's tips (the ring is
        // 144% of the world's width, so it reaches 0.72 of a size each side).
        const t = Math.min(-offset, 1);
        scale = 1 + 0.8 * t;
        const a = [w * rest[0], h * rest[1]];
        const aim = Math.hypot(a[0], h - a[1]);
        const clear = size * 1.8 * 0.72 + 30;
        const end = [(-a[0] / aim) * clear, h + ((h - a[1]) / aim) * clear];
        const dx = w * (rest[0] - wait[0]);
        const dy = h * (rest[1] - wait[1]);
        const reach = (Math.hypot(end[0] - a[0], end[1] - a[1]) * 0.3) / Math.hypot(dx, dy);
        [x, y] = curve(a, [a[0] + dx * reach, a[1] + dy * reach], end, t);
        opacity = 1;
      }
      const visible = offset > -1.05 && offset < 2;
      node.style.visibility = visible ? "visible" : "hidden";
      node.style.pointerEvents = visible && opacity > 0.2 ? "auto" : "none";
      node.style.opacity = String(clamp(opacity, 0, 1));
      node.style.zIndex = String(offset < 0 ? 3 : Math.max(0, 2 - i + Math.floor(progress)));
      node.style.transform = `translate3d(${x - size / 2}px,${y - size / 2}px,0) scale(${scale})`;
    });
  }

  // Dive keyframes for the stand-in world, as separate translate / scale /
  // opacity tracks. It reaches the viewport centre by `arrive` and grows on a
  // cubic ramp in log-scale, so it barely swells on the way and does most of
  // its growing, up to filling the screen, once centred: even, not skewed.
  function diveKeyframes(x: number, y: number, width: number): Keyframe[] {
    const arrive = 0.5;
    const grown = 0.85;
    const full = clamp((Math.max(innerWidth, innerHeight) * 1.1) / width, 2.4, 6);
    const shift = `${innerWidth * 0.5 - x}px ${innerHeight * 0.5 - y}px`;
    const steps = 16;
    const growth = Array.from({ length: steps + 1 }, (_, i): Keyframe => {
      const u = i / steps;
      return { offset: grown * u, scale: String(full ** (u * u * u)) };
    });
    return [
      ...growth,
      { offset: 0, translate: "0 0", opacity: 1, easing: "cubic-bezier(.45,0,.25,1)" },
      { offset: arrive, translate: shift, opacity: 1, easing: "ease-in-out" },
      { offset: grown, opacity: 0 },
      { offset: 1, translate: shift, scale: String(full), opacity: 0 },
    ].sort((a, b) => (a.offset as number) - (b.offset as number));
  }
  // Orbit rails and their glow; the eclipse fades separately, with the worlds.
  const rails = () => [...camera.querySelectorAll(".asset-orbits,.asset-trail")];
  const eclipse = () => camera.querySelector(".asset-eclipse");

  // Decode a scene's images before revealing it, so nothing paints half-drawn;
  // capped so a slow image never holds the transition hostage.
  const decoded = (imgs: HTMLImageElement[], cap: number) =>
    Promise.race([
      Promise.all(imgs.map((img) => img.decode().catch(() => {}))),
      new Promise((resolve) => setTimeout(resolve, cap)),
    ]);
  const sceneImages = (index: number) => [
    ...scene.querySelectorAll<HTMLImageElement>(".immersive-corona"),
    ...planets.slice(index, index + 2).flatMap((p) => [...p.querySelectorAll("img")]),
  ];

  async function enterCategory(c: AtlasCategory, index = 0, instant = false): Promise<void> {
    if (busy || introPlaying || !c.events.length) return;
    if (mode === "events") return switchCategory(c, index);
    busy = true;
    focusedWorld = categoryButtons[data.indexOf(c)];
    orbitTarget = orbitRotation;
    const rect = focusedWorld.querySelector(".world-art")!.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    buildSystem(c);
    scene.hidden = false;
    scene.inert = true;
    scene.style.opacity = "0";
    focusedWorld.classList.add("selected");
    // The dive moves a stand-in, never the atlas: moving and scaling the whole
    // atlas (masked rails, blurred glow, blend modes) while its layers fade
    // can't be re-rasterized fast enough and blinks. The atlas stays put and
    // only fades; the stand-in and its oversized raster are thrown away after.
    // A restored load has no dive to show, and the stand-in sits outside the
    // hidden atlas, so it would flash alone in the dark.
    const lens = instant ? null : document.createElement("div");
    if (lens) {
      lens.className = "atlas-lens";
      lens.setAttribute("aria-hidden", "true");
      lens.style.transformOrigin = `${x}px ${y}px`;
      const standIn = focusedWorld.cloneNode(true) as HTMLElement;
      standIn.removeAttribute("aria-label");
      standIn.tabIndex = -1;
      lens.append(standIn);
      overview.append(lens);
    }
    // The real world stays out of sight either way: the stand-in takes its
    // place in a dive, and on a restored load it would show through the fade.
    focusedWorld.style.visibility = "hidden";
    const ready = decoded(sceneImages(index), 500);
    const start = performance.now();
    // One slow sequence, as fractions of `duration`: the rails, eclipse and
    // other worlds fade out together while the chosen world drifts to centre,
    // barely growing, then swells to fill the screen as everything fades to
    // black; then the world's event scene fades up out of the black.
    const duration = instant ? 1 : 2400;
    const at = (t: number) => (reduce.matches ? 0 : duration * t);
    const fadeOut = (el: Element | null, from: number, length: number, frames: Keyframe[] = [{ opacity: 0 }]) =>
      el && animate(el, [{ opacity: getComputedStyle(el).opacity }, ...frames], duration * length, { delay: at(from), easing: "ease-in-out" });
    const intro = root.querySelector(".intro")!;
    const silk = root.querySelector(".foreground, .atlas-figures");
    const sky = root.querySelector(".sky")!;
    const copyFade = fadeOut(intro, 0, 0.35, [{ opacity: 0, translate: "-30px 0" }]);
    const decorFade = silk ? fadeOut(silk, 0, 0.35) : Promise.resolve();
    [frontCaption, eclipse(), ...rails(), ...categoryButtons.filter((b) => b !== focusedWorld)].forEach((el) => fadeOut(el, 0, 0.35));
    const skyFade = fadeOut(sky, 0.45, 0.4);
    const zooming = lens && animate(lens, diveKeyframes(x, y, rect.width), duration, { easing: "linear" });
    const revealing = ready.then(async () => {
      await new Promise((resolve) => setTimeout(resolve, Math.max(0, at(0.88) - (performance.now() - start))));
      if (disposed) return;
      await skyFade;
      // Switch the sky to its event-scene tint while the screen is black.
      root.dataset.mode = "events";
      // A restored load stays dark (data-intro hides the atlas and sky) until
      // here, then fades the world up from black a little slower.
      root.removeAttribute("data-intro");
      const length = instant ? 1400 : 900;
      const skyIn = animate(sky, [{ opacity: 0 }, { opacity: 1 }], length, { easing: "ease-out" });
      await animate(scene, [{ opacity: 0, transform: "scale(.97)" }, { opacity: 1, transform: "scale(1)" }], length, {
        easing: "cubic-bezier(.22,1,.36,1)",
      });
      await skyIn;
      cancelAnimations(sky);
    });
    await Promise.all([copyFade, decorFade, zooming, revealing]);
    lens?.remove();
    focusedWorld.style.visibility = "";
    if (disposed) return;
    mode = "events";
    root.dataset.mode = mode;
    overview.inert = true;
    overview.style.visibility = "hidden";
    scene.inert = false;
    scene.style.opacity = "1";
    scene.style.transform = "none";
    cancelAnimations(scene);
    $("scroll-track").style.height = `${innerHeight + (c.events.length - 1) * step()}px`;
    window.scrollTo({ top: index * step(), behavior: "instant" });
    progress = index;
    updateCopy(index);
    renderPlanets();
    busy = false;
    // Not on a restored load: with no input yet, Chrome treats programmatic
    // focus as keyboard focus and rings the back button on arrival.
    if (!instant) $("back").focus({ preventScroll: true });
  }

  async function leaveCategory() {
    if (busy || mode !== "events") return;
    busy = true;
    // Atlas images may have been discarded while hidden; decode them before
    // they become visible so none paint in half-drawn.
    await decoded([...overview.querySelectorAll("img")], 300);
    if (disposed) return;
    scene.inert = true;
    mode = "atlas";
    root.dataset.mode = mode;
    $("scroll-track").style.height = "0px";
    window.scrollTo({ top: 0, behavior: "instant" });
    overview.style.visibility = "visible";
    overview.inert = false;
    categoryButtons.forEach((b) => b.classList.remove("selected"));
    cancelAnimations(camera);
    const duration = 1300;
    const fade = animate(scene, [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.85)" }], duration * 0.5);
    // Fade only: moving the atlas while its layers fade is what blinks.
    const zoom = animate(camera, [{ opacity: 0 }, { opacity: 1 }], duration);
    // The dive's fade-out still holds the intro hidden; once the fade-in below
    // is dropped it would take over again and hide the heading and its link.
    const intro = root.querySelector(".intro")!;
    cancelAnimations(intro);
    const settling = [
      animate(intro, [{ opacity: 0, translate: "-20px 0" }, { opacity: 1, translate: "0 0" }], duration, {
        delay: reduce.matches ? 0 : 180,
        fill: "both",
      }),
    ];
    const silk = root.querySelector(".foreground, .atlas-figures");
    if (silk) {
      cancelAnimations(silk);
      settling.push(animate(silk, [{ opacity: 0 }, { opacity: getComputedStyle(silk).opacity }], duration));
    }
    categoryButtons.forEach((b) => {
      cancelAnimations(b);
      b.style.opacity = "1";
      settling.push(animate(b, [{ opacity: 0 }, { opacity: 1 }], duration, { delay: reduce.matches ? 0 : 120, fill: "both" }));
    });
    // A world entered earlier and then switched away from via the dock still
    // holds its faded-out artwork; clear every one, then fade in the current.
    categoryButtons.forEach((b) => cancelAnimations(b.querySelector(".world-artwork")!));
    if (focusedWorld) settling.push(animate(focusedWorld.querySelector(".world-artwork")!, [{ opacity: 0 }, { opacity: 1 }], duration));
    // Reverse of the dive: worlds first, then the eclipse, rails and caption.
    // The rail glow returns on its own once travel ends (.atlas-travel).
    const railLayers = rails();
    [...railLayers, eclipse(), frontCaption].forEach((el) => el && cancelAnimations(el));
    railLayers
      .filter((el) => el.classList.contains("asset-orbits"))
      .concat(eclipse() ?? [], frontCaption)
      .forEach((el) =>
        settling.push(
          animate(el, [{ opacity: 0 }, { opacity: getComputedStyle(el).opacity }], duration * 0.6, {
            delay: reduce.matches ? 0 : duration * 0.4,
            fill: "both",
            easing: "ease-in-out",
          }),
        ),
      );
    await Promise.all([fade, zoom]);
    if (disposed) return;
    scene.hidden = true;
    // Release the world's planets: their full-size art otherwise stays in the
    // decode cache and evicts the atlas images, which then re-decode mid-orbit.
    // enterCategory rebuilds them.
    $("planet-system").replaceChildren();
    planets = [];
    cancelAnimations(scene);
    cancelAnimations(camera);
    camera.style.transform = "none";
    clearAtlasSpot();
    busy = false;
    focusedWorld?.focus({ preventScroll: true });
    // Drop the finished fade-ins once they end: a lingering fill keeps every
    // world on its own compositor layer, repainted each frame by the float.
    Promise.all(settling).then((done) => done.forEach((a) => a.cancel()));
  }

  async function switchCategory(c: AtlasCategory, index = 0): Promise<void> {
    if (busy || !c.events.length) return;
    if (mode === "atlas") return enterCategory(c, index);
    if (c === category) {
      goTo(index);
      return;
    }
    busy = true;
    scene.inert = true;
    await animate(scene, [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.12)" }], 430);
    if (disposed) return;
    buildSystem(c);
    $("scroll-track").style.height = `${innerHeight + (c.events.length - 1) * step()}px`;
    window.scrollTo({ top: index * step(), behavior: "instant" });
    progress = index;
    updateCopy(index);
    renderPlanets();
    focusedWorld = categoryButtons[data.indexOf(c)];
    cancelAnimations(camera);
    camera.style.transform = "none";
    await decoded(sceneImages(index), 500);
    await animate(scene, [{ opacity: 0, transform: "scale(.88)" }, { opacity: 1, transform: "scale(1)" }], 650);
    if (disposed) return;
    window.scrollTo({ top: index * step(), behavior: "instant" });
    progress = index;
    updateCopy(index);
    renderPlanets();
    scene.style.opacity = "1";
    scene.style.transform = "none";
    cancelAnimations(scene);
    scene.inert = false;
    busy = false;
  }

  // Resting spots are whole worlds: when scrolling settles between two,
  // glide to the nearer one.
  let snapTimer = 0;
  on(
    window,
    "scroll",
    () => {
      clearTimeout(snapTimer);
      snapTimer = window.setTimeout(() => {
        if (mode !== "events" || busy || !category || directory.open) return;
        const top = document.scrollingElement!.scrollTop;
        const target = clamp(Math.round(top / step()), 0, category.events.length - 1) * step();
        if (Math.abs(top - target) > 2) window.scrollTo({ top: target, behavior: reduce.matches ? "instant" : "smooth" });
      }, 160);
    },
    { passive: true },
  );

  function goTo(index: number) {
    if (busy || !category) return;
    window.scrollTo({ top: clamp(index, 0, category.events.length - 1) * step(), behavior: reduce.matches ? "instant" : "smooth" });
  }

  on($("back"), "click", leaveCategory);
  on($("previous"), "click", () => goTo(active - 1));
  on($("next"), "click", () => goTo(active + 1));

  function discover() {
    if (busy || !category) return;
    onDiscover(category.id, category.events[active].id);
  }
  on($("discover"), "click", discover);

  function renderDirectory() {
    const query = $<HTMLInputElement>("event-search").value.toLowerCase().trim();
    const container = $("directory-results");
    container.replaceChildren();
    let count = 0;
    data.forEach((c) =>
      c.events.forEach((e, i) => {
        if (directoryFilter !== "all" && directoryFilter !== c.id) return;
        if (query && !`${c.name} ${c.kind} ${e.id} ${e.name} ${e.description} ${e.kind}`.toLowerCase().includes(query)) return;
        count++;
        const b = document.createElement("button");
        b.className = "directory-entry";
        const thumbnail = image(atlasArt.event(c.id, e.id), "");
        thumbnail.loading = "lazy";
        const text = document.createElement("span");
        const name = document.createElement("strong");
        const kind = document.createElement("small");
        name.textContent = e.name;
        kind.textContent = `${c.name} / ${e.kind}`;
        text.append(name, kind);
        const arrow = document.createElement("span");
        arrow.textContent = "↗";
        arrow.setAttribute("aria-hidden", "true");
        b.append(thumbnail, text, arrow);
        on(b, "click", () => {
          directory.close();
          if (mode === "atlas") enterCategory(c, i);
          else switchCategory(c, i);
        });
        container.append(b);
      }),
    );
    $("no-results").hidden = count > 0;
  }

  [["all", "All worlds"], ...data.map((c) => [c.id, c.name])].forEach(([id, name]) => {
    const b = document.createElement("button");
    b.textContent = name;
    b.setAttribute("aria-pressed", String(id === "all"));
    on(b, "click", () => {
      directoryFilter = id;
      [...$("directory-filters").children].forEach((el) => el.setAttribute("aria-pressed", String(el === b)));
      renderDirectory();
    });
    $("directory-filters").append(b);
  });

  function openModal(dialog: HTMLDialogElement) {
    modalScroll = document.scrollingElement!.scrollTop;
    dialog.showModal();
    window.scrollTo({ top: modalScroll, behavior: "instant" });
  }
  function openDirectory() {
    if (busy) return;
    renderDirectory();
    openModal(directory);
  }
  on($("browse-bottom"), "click", openDirectory);
  on($("event-search"), "input", renderDirectory);
  root.querySelectorAll<HTMLElement>("[data-close]").forEach((b) =>
    on(b, "click", () => $<HTMLDialogElement>(b.dataset.close!).close()),
  );
  on(directory, "close", () => {
    if (!busy) window.scrollTo({ top: modalScroll, behavior: "instant" });
  });
  on<MouseEvent>(directory, "click", (e) => {
    if (e.target !== directory) return;
    const r = directory.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) directory.close();
  });

  on<KeyboardEvent>(window, "keydown", (e) => {
    if (!directory.open && !busy && mode === "atlas" && ["ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      turnOrbit(e.key === "ArrowLeft" ? -1 : 1);
      return;
    }
    if (directory.open || busy || mode !== "events" || (e.target as Element).matches?.("input,textarea")) return;
    if (e.key === "Escape") {
      leaveCategory();
      return;
    }
    if (["ArrowRight", "ArrowDown", "PageDown"].includes(e.key)) {
      e.preventDefault();
      goTo(active + 1);
    }
    if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
      e.preventDefault();
      goTo(active - 1);
    }
    if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    }
    if (e.key === "End" && category) {
      e.preventDefault();
      goTo(category.events.length - 1);
    }
  });
  on<PointerEvent>(
    window,
    "pointermove",
    (e) => {
      pointerX = e.clientX / innerWidth - 0.5;
      pointerY = e.clientY / innerHeight - 0.5;
    },
    { passive: true },
  );
  on(window, "resize", layout, { passive: true });

  function frame(time: number) {
    const dt = Math.min(3, (time - previousTime) / 16.667 || 1);
    previousTime = time;
    // Opening drift: the system eases from rest through just over a world's
    // step and settles the front world, sine in-out so it never whips.
    if (introSpin) {
      const t = clamp((performance.now() - introSpin.start) / introSpin.duration, 0, 1);
      orbitRotation = introSpin.to + ((introSpin.from - introSpin.to) * (1 + Math.cos(Math.PI * t))) / 2;
      if (t >= 1) {
        orbitRotation = orbitTarget = introSpin.to;
        introSpin = null;
      }
      renderOrbit();
    }
    if (mode === "atlas" && !busy && !introSpin && Math.abs(orbitTarget - orbitRotation) > 0.0001) {
      orbitRotation = reduce.matches
        ? orbitTarget
        : orbitRotation + (orbitTarget - orbitRotation) * (1 - Math.pow(orbitGesture?.moved ? 0.66 : 0.88, dt));
      if (Math.abs(orbitTarget - orbitRotation) < 0.0001) orbitRotation = orbitTarget;
      renderOrbit();
    }
    // The blurred rail glow is the costliest layer to rescale; drop it while
    // travelling and let it fade back once the camera has settled.
    if (traveling !== busy) {
      traveling = busy;
      root.classList.toggle("atlas-travel", busy);
    }
    // Idle life: worlds float gently on their rail; the orbit itself holds
    // still so the front slot stays put. Paused while the camera zooms, since
    // any style write inside it forces the scaled layer to repaint each frame.
    if (mode === "atlas" && !busy && !reduce.matches) {
      floatClock += dt * 16.667;
      const s = floatClock / 1000;
      categoryButtons.forEach((b, i) => {
        b.style.setProperty("--bob", `${(Math.sin(s * 0.9 + i * 1.7) * 2.6).toFixed(2)}px`);
        b.style.setProperty("--sway", `${(Math.sin(s * 0.55 + i * 2.3) * 1.1).toFixed(3)}deg`);
      });
    }
    if (!reduce.matches && (Math.abs(pointerX * 12 - skyX) > 0.003 || Math.abs(pointerY * 8 - skyY) > 0.003)) {
      skyX += (pointerX * 12 - skyX) * 0.045 * dt;
      skyY += (pointerY * 8 - skyY) * 0.045 * dt;
      skyTexture.style.transform = `translate3d(${skyX}px,${skyY}px,0) scale(1.04)`;
      dust.style.transform = `translate3d(${-skyX * 1.7}px,${-skyY * 1.7}px,0)`;
      camera.style.setProperty("--depth-x", `${-skyX * 1.8}px`);
      camera.style.setProperty("--depth-y", `${-skyY * 1.8}px`);
    }
    if (mode === "events" && !busy && !directory.open && category) {
      const target = clamp(document.scrollingElement!.scrollTop / step(), 0, category.events.length - 1);
      if (target !== progress) {
        progress = reduce.matches ? target : progress + (target - progress) * (1 - Math.pow(0.86, dt));
        if (Math.abs(target - progress) < 0.0005) progress = target;
        renderPlanets();
        updateCopy(clamp(Math.round(progress), 0, category.events.length - 1));
      }
    }
    rafId = requestAnimationFrame(frame);
  }

  layout();
  rafId = requestAnimationFrame(frame);
  const initialImages = [...root.querySelectorAll<HTMLImageElement>("#category-worlds img,.asset-eclipse img,.asset-orbits")];
  const imagesReady = decoded(initialImages, 2500).then(() => {
    if (!disposed) loadStatus.hidden = true;
  });
  loadTimeout = window.setTimeout(() => (loadStatus.hidden = true), 8000);

  // The site's opening loader may still be covering the page on a first
  // visit; start the entrance as its iris opens so the eclipses hand over.
  const loaderDone = () =>
    new Promise<void>((resolve) => {
      const settled = () => {
        const loader = document.querySelector(".site-loader");
        return !loader || loader.classList.contains("is-exit");
      };
      if (settled()) return resolve();
      const observer = new MutationObserver(() => {
        if (!settled()) return;
        observer.disconnect();
        resolve();
      });
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
      signal.addEventListener("abort", () => observer.disconnect());
      window.setTimeout(() => {
        observer.disconnect();
        resolve();
      }, 7500);
    });

  /**
   * Entrance, ~4.6 s, kept slow and restrained: the sky and eclipse surface,
   * the orbit settles into place, light runs once round the outer rail, the
   * worlds fade in as the system turns just over a world and seats a random one in front,
   * then the title, link, caption and silk arrive. Every move is short in
   * distance and long in time. It always plays through; input waits for it.
   */
  function playIntro() {
    root.removeAttribute("data-intro");
    if (reduce.matches) {
      orbitRotation = orbitTarget = introSeat;
      renderOrbit();
      return;
    }
    introPlaying = true;
    root.classList.add("atlas-intro");
    const out = "cubic-bezier(.16,1,.3,1)";
    const play = (el: Element | null, frames: Keyframe[], delay: number, duration: number, easing = out) => {
      if (!el) return;
      introAnimations.push(el.animate(frames, { delay, duration, easing, fill: "backwards" }));
    };
    const q = (selector: string) => root.querySelector(selector);
    const all = (selector: string) => [...root.querySelectorAll(selector)];

    play(q(".sky"), [{ opacity: 0 }, { opacity: 1 }], 0, 1600, "ease-out");
    play(q(".asset-eclipse"), [{ opacity: 0, scale: ".82" }, { opacity: 1, scale: "1" }], 150, 2000);
    play(q(".asset-corona"), [{ filter: "brightness(1.8)" }, { filter: "brightness(1)" }], 400, 2600);
    all(".asset-orbits").forEach((el) => play(el, [{ opacity: 0, translate: "0 20px", scale: ".97" }, {}], 400, 2000));
    all(".asset-trail").forEach((el) => play(el, [{ opacity: 0 }, {}], 1000, 800, "ease-out"));
    // Light runs once round the outer rail, leaving the glow behind it.
    all(".trail-loop").forEach((path) => {
      path.setAttribute("pathLength", "1");
      play(path, [{ strokeDasharray: "1 1", strokeDashoffset: "1" }, { strokeDasharray: "1 1", strokeDashoffset: "0" }], 1000, 2400, "cubic-bezier(.45,0,.2,1)");
    });
    // Just over a step: the front slot starts close to a world and its gap
    // passes mid-ease at speed. Much more fractional (1.25+ with the old
    // tail-heavy ease) left it empty until the slow tail brought a world in.
    introSpin = { start: performance.now() + 500, duration: 3800, from: introSeat - ORBIT_STEP * 1.2, to: introSeat };
    orbitRotation = orbitTarget = introSpin.from;
    renderOrbit();
    categoryButtons.forEach((b, i) => {
      play(b, [{ opacity: 0, scale: ".9", translate: "0 12px" }, {}], 550 + i * 120, 1600);
      play(solar?.occluders[i] ?? null, [{ opacity: 0 }, {}], 550 + i * 120, 1600);
    });
    play(q(".intro .eyebrow"), [{ opacity: 0, translate: "0 10px" }, {}], 1700, 1000);
    play(q(".intro h1"), [{ opacity: 0, translate: "0 20px", clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }], 1850, 1300);
    play(q(".intro-note"), [{ opacity: 0, translate: "0 10px" }, {}], 2300, 1000);
    play(q("#browse-bottom"), [{ opacity: 0, translate: "0 10px" }, {}], 2500, 1000);
    play(frontCaption, [{ opacity: 0, translate: "0 10px" }, { opacity: 1 }], 3600, 1000);
    play(q(".foreground, .atlas-figures"), [{ opacity: 0, translate: "0 40px" }, {}], 2000, 1600);
    Promise.all(introAnimations.map((a) => a.finished.catch(() => {}))).then(endIntro);
  }

  function endIntro() {
    if (!introPlaying || disposed) return;
    introPlaying = false;
    root.classList.remove("atlas-intro");
    introAnimations.forEach((a) => a.cancel());
    introAnimations = [];
    root.querySelectorAll(".trail-loop").forEach((path) => path.removeAttribute("pathLength"));
    if (introSpin) {
      introSpin = null;
      orbitRotation = orbitTarget = introSeat;
      renderOrbit();
    }
  }


  // Back from an event page: reopen straight into that world.
  const spot = readAtlasSpot();
  const initial = data.find((c) => c.id === spot?.category && c.events.length);
  if (initial) {
    enterCategory(initial, Math.max(0, initial.events.findIndex((e) => e.id === spot?.event)), true);
  } else {
    Promise.all([imagesReady, loaderDone()]).then(() => {
      if (!disposed) playIntro();
    });
  }

  return () => {
    disposed = true;
    controller.abort();
    cancelAnimationFrame(rafId);
    clearTimeout(wheelSnap);
    clearTimeout(snapTimer);
    clearTimeout(loadTimeout);
    root.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    solar?.destroy();
    for (const id of ["category-worlds", "category-dock", "planet-system", "event-progress", "directory-filters", "directory-results"]) {
      $(id).replaceChildren();
    }
    if (directory.open) directory.close();
    $("scroll-track").style.height = "0px";
  };
}

