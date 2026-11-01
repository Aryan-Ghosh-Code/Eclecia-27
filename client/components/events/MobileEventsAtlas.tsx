/* eslint-disable @next/next/no-img-element */
"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { GoldActionButton } from "@/components/common/GoldButton";
import {
  ATLAS_CATEGORIES,
  atlasArt,
  type AtlasCategory,
} from "@/constants/events";
import { ASSETS } from "@/constants/assets";
import { clearAtlasSpot, readAtlasSpot } from "./atlas/atlas-spot";
import "@/styles/mobile-events.css";

type Selection = {
  mode: "categories" | "events";
  category: number;
  event: number;
};
const count = ATLAS_CATEGORIES.length;
type CategoryOrder = readonly AtlasCategory[];

function shuffledCategories(canonical: CategoryOrder) {
  const order = [...canonical];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
const wrap = (n: number, length: number) => ((n % length) + length) % length;
const distance = (n: number, from: number, length: number) =>
  wrap(n - from + Math.floor(length / 2), length) - Math.floor(length / 2);
const chakra =
  ASSETS.cloudinary.chakraFrame ||
  "/assets/opt/events/mobile/chakra-frame-v1.webp";
const categoryThumb = (id: string) =>
  "/assets/opt/events/mobile/thumbnails/categories/" + id + "/artwork.webp";
const eventThumb = (world: string, id: string) =>
  "/assets/opt/events/mobile/thumbnails/events/" +
  world +
  "/" +
  id +
  "/artwork.webp";
const subscribeMotion = (notify: () => void) => {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const motionSnapshot = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;
const serverMotion = () => false;

function initialSelection(categories: CategoryOrder): Selection {
  // Back from an event page: reopen straight into that world.
  const spot = readAtlasSpot();
  const index = categories.findIndex(
    (c) => c.id === spot?.category && c.events.length,
  );
  if (index < 0) return { mode: "categories", category: 0, event: 0 };
  return {
    mode: "events",
    category: index,
    event: Math.max(
      0,
      categories[index].events.findIndex((e) => e.id === spot?.event),
    ),
  };
}

/**
 * Approved phone-only Chakra Dial. Shares content, artwork and the site header,
 * not the desktop scene engine. Discrete React state; drag feedback stays on
 * one DOM transform, with no per-pointer-move renders or animation loop.
 */
export function MobileEventsAtlas({
  categories: canonical,
  eventCount,
  onDiscover,
}: {
  categories: AtlasCategory[];
  eventCount: number;
  onDiscover: (categoryId: string, eventId: string) => void;
}) {
  // Shuffle once per mount, keeping swipes, arrows and shortcuts in one order.
  // This component only mounts on the client.
  const [categories] = useState(() => shuffledCategories(canonical));
  const [selection, setSelection] = useState<Selection>(() =>
    initialSelection(categories),
  );
  const [dialTurn, setDialTurn] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [assetError, setAssetError] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeMotion,
    motionSnapshot,
    serverMotion,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const directoryRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const alive = useRef(true);
  const busy = useRef(false);
  const focusFrame = useRef(0);
  const blockedClick = useRef(false);
  const blockTimer = useRef(0);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    time: number;
    dx: number;
    horizontal: boolean;
  } | null>(null);
  const c = categories[selection.category];
  const event = c.events[selection.event];
  const inEvents = selection.mode === "events";

  useEffect(() => {
    alive.current = true;
    const root = rootRef.current;
    const directory = directoryRef.current;
    return () => {
      alive.current = false;
      cancelAnimationFrame(focusFrame.current);
      clearTimeout(blockTimer.current);
      root?.getAnimations({ subtree: true }).forEach((a) => a.cancel());
      directory?.close();
    };
  }, []);

  useLayoutEffect(() => {
    const copy = copyRef.current;
    if (!copy || reduced) return;
    const animation = copy.animate(
      [
        { opacity: 0.25, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 280, easing: "cubic-bezier(.22,1,.36,1)" },
    );
    return () => animation.cancel();
  }, [selection.category, selection.event, selection.mode, reduced]);

  function selectCategory(index: number) {
    if (busy.current) return;
    const next = wrap(index, count);
    setDialTurn(
      (turn) =>
        turn + (distance(next, selection.category, count) * 360) / count,
    );
    setSelection({ mode: "categories", category: next, event: 0 });
    rootRef.current?.scrollTo({ top: 0, behavior: "instant" });
    if (document.activeElement?.classList.contains("m-world")) {
      focusFrame.current = requestAnimationFrame(() =>
        rootRef.current
          ?.querySelector<HTMLButtonElement>(".m-world[tabindex='0']")
          ?.focus({ preventScroll: true }),
      );
    }
  }

  async function changeView(next: Selection) {
    if (busy.current) return;
    busy.current = true;
    setTransitioning(true);
    const panel = panelRef.current;
    if (panel && !reduced) {
      await panel
        .animate(
          [
            { opacity: 1, transform: "scale(1)" },
            { opacity: 0, transform: "scale(1.035)" },
          ],
          {
            duration: 180,
            fill: "forwards",
            easing: "cubic-bezier(.4,0,.6,1)",
          },
        )
        .finished.catch(() => {});
    }
    if (!alive.current) return;
    setSelection(next);
    if (next.mode === "categories") clearAtlasSpot();
    rootRef.current?.scrollTo({ top: 0, behavior: "instant" });
    focusFrame.current = requestAnimationFrame(() => {
      if (!alive.current) return;
      const incoming = panelRef.current;
      incoming?.getAnimations().forEach((a) => a.cancel());
      if (incoming && !reduced)
        incoming.animate(
          [
            { opacity: 0, transform: "translateY(12px) scale(.985)" },
            { opacity: 1, transform: "translateY(0) scale(1)" },
          ],
          { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" },
        );
      busy.current = false;
      setTransitioning(false);
      (next.mode === "events"
        ? backRef.current
        : rootRef.current?.querySelector<HTMLButtonElement>("#m-explore")
      )?.focus({ preventScroll: true });
    });
  }

  function openCategory(index = selection.category, eventIndex = 0) {
    if (blockedClick.current || !categories[index].events.length) return;
    void changeView({ mode: "events", category: index, event: eventIndex });
  }

  function stepEvent(index: number) {
    if (busy.current || index < 0 || index >= c.events.length) return;
    const next: Selection = { ...selection, event: index };
    setSelection(next);
    rootRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }

  function advance(direction: number) {
    if (inEvents) stepEvent(selection.event + direction);
    else selectCategory(selection.category + direction);
  }

  function resetDrag() {
    if (trackRef.current) {
      trackRef.current.style.transition = "";
      trackRef.current.style.transform = "";
    }
  }
  function pointerDown(e: ReactPointerEvent<HTMLElement>) {
    if (busy.current || gesture.current || !e.isPrimary || e.button !== 0)
      return;
    gesture.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      time: e.timeStamp,
      dx: 0,
      horizontal: false,
    };
  }
  function pointerMove(e: ReactPointerEvent<HTMLElement>) {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x,
      dy = e.clientY - g.y;
    if (!g.horizontal) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        gesture.current = null;
        return;
      }
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return;
      g.horizontal = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    e.preventDefault();
    g.dx = dx;
    if (trackRef.current) {
      const atEnd =
        inEvents &&
        ((selection.event === 0 && dx > 0) ||
          (selection.event === c.events.length - 1 && dx < 0));
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform =
        "translate3d(" + dx * (atEnd ? 0.16 : 0.48) + "px,0,0)";
    }
  }
  function pointerEnd(e: ReactPointerEvent<HTMLElement>, canceled = false) {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    gesture.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    resetDrag();
    if (!g.horizontal) return;
    blockedClick.current = true;
    clearTimeout(blockTimer.current);
    blockTimer.current = window.setTimeout(() => {
      blockedClick.current = false;
    }, 300);
    const speed = Math.abs(g.dx) / Math.max(1, e.timeStamp - g.time);
    if (
      !canceled &&
      (Math.abs(g.dx) > 40 || (Math.abs(g.dx) > 14 && speed > 0.3))
    )
      advance(g.dx < 0 ? 1 : -1);
  }
  const swipe = {
    onPointerDown: pointerDown,
    onPointerMove: pointerMove,
    onPointerUp: pointerEnd,
    onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => pointerEnd(e, true),
  };

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories.flatMap((world, categoryIndex) =>
      world.events.flatMap((item, eventIndex) =>
        (filter === "all" || filter === world.id) &&
        (!q ||
          [world.name, world.kind, item.name, item.kind, item.description]
            .join(" ")
            .toLowerCase()
            .includes(q))
          ? [{ world, item, categoryIndex, eventIndex }]
          : [],
      ),
    );
  }, [query, filter, categories]);

  const imageFailed = () => setAssetError(true);
  const canClick = () => !blockedClick.current;
  const previous = categories[wrap(selection.category - 1, count)];
  const next = categories[wrap(selection.category + 1, count)];

  function openDirectory() {
    if (busy.current) return;
    directoryRef.current?.showModal();
    searchRef.current?.focus();
  }

  return (
    <div
      ref={rootRef}
      className="mobile-events"
      data-view={selection.mode}
      onKeyDown={(e) => {
        if (
          directoryRef.current?.open ||
          (e.target as HTMLElement).matches("input,textarea")
        )
          return;
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          advance(e.key === "ArrowRight" ? 1 : -1);
        }
        if (e.key === "Escape" && inEvents) {
          e.preventDefault();
          void changeView({ ...selection, mode: "categories" });
        }
      }}
    >
      <div
        className="m-sky"
        aria-hidden="true"
        style={
          ASSETS.cloudinary.eventsBackground
            ? { backgroundImage: `url(${ASSETS.cloudinary.eventsBackground})` }
            : undefined
        }
      />
      <div className="m-figures" aria-hidden="true">
        <img
          className="m-figure m-figure--veena"
          src={ASSETS.cloudinary.veena}
          alt=""
          draggable={false}
        />
        <img
          className="m-figure m-figure--hand"
          src={ASSETS.cloudinary.hand}
          alt=""
          draggable={false}
        />
      </div>
      <main id="main" className="m-shell" tabIndex={-1}>
        <div ref={panelRef} className="m-view" aria-busy={transitioning}>
          {!inEvents ? (
            <section
              aria-label="Choose an event category"
              className="m-categories"
            >
              <header className="m-intro">
                <h1>
                  Find your <em>stage.</em>
                </h1>
                <p>
                  7 Worlds <span aria-hidden="true">/</span> {eventCount} events
                </p>
              </header>
              <div
                className="m-dial"
                {...swipe}
                aria-roledescription="carousel"
                aria-label="Swipe between seven categories"
              >
                <div
                  className="m-chakra"
                  aria-hidden="true"
                  style={{
                    transform:
                      "translate(-50%,-50%) rotate(" + dialTurn + "deg)",
                  }}
                >
                  <img
                    className="m-chakra-art"
                    src={chakra}
                    alt=""
                    draggable={false}
                    onError={imageFailed}
                  />
                </div>
                <div className="m-swipe-track" ref={trackRef}>
                  {categories.map((world, index) => {
                    const offset = distance(index, selection.category, count);
                    if (Math.abs(offset) > 1) return null;
                    return (
                      <button
                        key={world.id}
                        type="button"
                        className="m-world"
                        style={
                          {
                            "--offset": offset,
                            "--world-scale": offset === 0 ? 1 : 0.76,
                            "--world-brightness": offset === 0 ? 1 : 0.55,
                            "--art-scale": offset === 0 ? 1.32 : 1,
                          } as CSSProperties
                        }
                        tabIndex={offset === 0 ? 0 : -1}
                        aria-hidden={offset !== 0}
                        aria-label={
                          "Enter " +
                          world.name +
                          ", " +
                          world.events.length +
                          " events"
                        }
                        onClick={() => {
                          if (canClick()) {
                            if (offset === 0) openCategory();
                            else selectCategory(index);
                          }
                        }}
                      >
                        <img
                          className="m-world-base"
                          src={atlasArt.shared("medallion-base")}
                          alt=""
                          draggable={false}
                          onError={imageFailed}
                        />
                        <img
                          className="m-world-art"
                          src={atlasArt.category(world.id)}
                          alt=""
                          draggable={false}
                          onError={imageFailed}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div
                className="m-category-copy"
                ref={copyRef}
                aria-live="polite"
                aria-atomic="true"
              >
                <h2>{c.name}</h2>
                <p className="m-category-meta">
                  {c.kind} <span aria-hidden="true">/</span> {c.events.length}{" "}
                  events
                </p>
                {c.line && <p className="m-category-tagline">{c.line}</p>}
              </div>
              <div className="m-category-actions">
                <GoldActionButton
                  id="m-explore"
                  className="m-cta"
                  variant="ghost"
                  disabled={transitioning || !c.events.length}
                  onClick={() => openCategory()}
                >
                  Explore {c.events.length} events{" "}
                  <span aria-hidden="true">→</span>
                </GoldActionButton>
                <nav
                  className="m-category-arrows"
                  aria-label="Previous and next categories"
                >
                  <button
                    type="button"
                    onClick={() => selectCategory(selection.category - 1)}
                    aria-label={"Previous category: " + previous.name}
                  >
                    ← <span>{previous.name}</span>
                  </button>
                  <span aria-live="polite">
                    {selection.category + 1} of {count}
                  </span>
                  <button
                    type="button"
                    onClick={() => selectCategory(selection.category + 1)}
                    aria-label={"Next category: " + next.name}
                  >
                    <span>{next.name}</span> →
                  </button>
                </nav>
                <nav
                  className="m-category-shortcuts"
                  aria-label="All seven categories"
                >
                  {categories.map((world, index) => (
                    <button
                      key={world.id}
                      type="button"
                      onClick={() => selectCategory(index)}
                      aria-label={"Show " + world.name + " category"}
                      aria-pressed={selection.category === index}
                      title={world.name}
                    >
                      <span>
                        <img
                          src={categoryThumb(world.id)}
                          alt=""
                          draggable={false}
                          onError={imageFailed}
                        />
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </section>
          ) : (
            <section aria-label={c.name + " events"} className="m-events">
              <nav className="m-breadcrumb" aria-label="Category navigation">
                <button
                  type="button"
                  ref={backRef}
                  className="m-breadcrumb-back"
                  onClick={() =>
                    void changeView({ ...selection, mode: "categories" })
                  }
                >
                  <span className="m-breadcrumb-back-arrow" aria-hidden="true">&larr;</span> <span>All categories</span>
                </button>
                <div className="m-breadcrumb-event-nav">
                  <button
                    type="button"
                    className="m-event-header-btn"
                    disabled={selection.event <= 0}
                    onClick={() => stepEvent(selection.event - 1)}
                    aria-label="Previous event"
                  >
                    &#8249;
                  </button>
                  <span className="m-breadcrumb-event-count">
                    {selection.event + 1} / {c.events.length}
                  </span>
                  <button
                    type="button"
                    className="m-event-header-btn"
                    disabled={selection.event >= c.events.length - 1}
                    onClick={() => stepEvent(selection.event + 1)}
                    aria-label="Next event"
                  >
                    &#8250;
                  </button>
                </div>
              </nav>
              <div
                className="m-event-visual"
                {...swipe}
                aria-roledescription="carousel"
                aria-label="Swipe between events"
              >
                <div
                  className="m-chakra m-event-chakra"
                  aria-hidden="true"
                  style={{
                    transform:
                      "translate(-50%,-50%) rotate(" +
                      (selection.event * 18 + dialTurn) +
                      "deg)",
                  }}
                >
                  <img
                    className="m-chakra-art"
                    src={chakra}
                    alt=""
                    draggable={false}
                    onError={imageFailed}
                  />
                </div>
                <div className="m-swipe-track" ref={trackRef}>
                  {c.events.map((item, index) => {
                    const offset = index - selection.event;
                    if (Math.abs(offset) > 1) return null;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="m-event-world"
                        style={
                          {
                            "--offset": offset,
                            "--world-brightness": offset === 0 ? 1 : 0.55,
                            "--art-scale": offset === 0 ? 1.21 : 1,
                          } as CSSProperties
                        }
                        tabIndex={offset === 0 ? 0 : -1}
                        aria-hidden={offset !== 0}
                        aria-label={"Enter " + item.name}
                        onClick={() => {
                          if (canClick()) {
                            if (offset === 0) onDiscover(c.id, item.id);
                            else stepEvent(index);
                          }
                        }}
                      >
                        <img
                          className="m-world-base"
                          src={atlasArt.shared("planet-base")}
                          alt=""
                          draggable={false}
                        />
                        <img
                          className="m-world-art"
                          src={atlasArt.event(c.id, item.id)}
                          alt=""
                          draggable={false}
                          onError={imageFailed}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div
                ref={copyRef}
                className="m-event-copy"
                aria-live="polite"
                aria-atomic="true"
              >
                <h1
                  onClick={() => onDiscover(c.id, event.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onDiscover(c.id, event.id);
                    }
                  }}
                  className="m-event-title-clickable"
                >
                  {event.name}
                </h1>
                <div className="m-event-meta">
                  <span className="m-meta-kind">{event.kind}</span>
                  {event.club && (
                    <>
                      <span className="m-meta-rule" aria-hidden="true" />
                      <span className="m-meta-club">{event.club}</span>
                    </>
                  )}
                </div>
                <p>{event.description}</p>
              </div>
              <div className="m-event-actions">
                <GoldActionButton
                  className="m-cta"
                  variant="ghost"
                  onClick={() => onDiscover(c.id, event.id)}
                >
                  Discover Event
                </GoldActionButton>
                <nav
                  className="m-event-progress"
                  aria-label="Events in this category"
                >
                  <p aria-live="polite">
                    {selection.event + 1} of {c.events.length} events
                  </p>
                  <div>
                    {c.events.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => stepEvent(index)}
                        aria-label={"Go to " + item.name}
                        aria-current={
                          index === selection.event ? "step" : undefined
                        }
                      >
                        <span />
                      </button>
                    ))}
                  </div>
                </nav>
              </div>
            </section>
          )}
        </div>
        <footer className="m-footer">
          <button type="button" className="m-browse" onClick={openDirectory}>
            Browse all events <span aria-hidden="true">→</span>
          </button>
          {assetError && (
            <p role="status" className="m-asset-error">
              Some artwork could not load. All events are still available below.
            </p>
          )}
        </footer>
      </main>

      <dialog
        ref={directoryRef}
        className="m-dialog m-directory"
        aria-labelledby="m-directory-title"
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            e.currentTarget.close();
        }}
      >
        <button
          className="m-close"
          aria-label="Close event directory"
          type="button"
          onClick={() => directoryRef.current?.close()}
        >
          ×
        </button>
        <p className="m-kicker">7 categories. {eventCount} events.</p>
        <h2 id="m-directory-title">Find your stage.</h2>
        <label className="m-search-label" htmlFor="m-event-search">
          Search events or categories
        </label>
        <input
          ref={searchRef}
          id="m-event-search"
          type="search"
          placeholder="Search for your event…"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div
          className="m-filters"
          role="group"
          aria-label="Filter events by category"
        >
          {[{ id: "all", name: "All worlds" }, ...categories].map((world) => (
            <button
              key={world.id}
              type="button"
              aria-pressed={filter === world.id}
              onClick={() => setFilter(world.id)}
            >
              {world.name}
            </button>
          ))}
        </div>
        <p className="m-result-count" aria-live="polite">
          {matches.length} {matches.length === 1 ? "event" : "events"}
        </p>
        <div className="m-results">
          {matches.map(({ world, item, categoryIndex, eventIndex }) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                directoryRef.current?.close();
                setDialTurn(
                  (turn) =>
                    turn +
                    (distance(categoryIndex, selection.category, count) * 360) /
                      count,
                );
                openCategory(categoryIndex, eventIndex);
              }}
            >
              <img src={eventThumb(world.id, item.id)} alt="" loading="lazy" />
              <span>
                <strong>{item.name}</strong>
                <small>
                  {world.name} / {item.kind}
                </small>
              </span>
              <span aria-hidden="true">↗</span>
            </button>
          ))}
          {matches.length === 0 && (
            <p className="m-empty">
              No events found. Try another name or choose All worlds.
            </p>
          )}
        </div>
      </dialog>
    </div>
  );
}
