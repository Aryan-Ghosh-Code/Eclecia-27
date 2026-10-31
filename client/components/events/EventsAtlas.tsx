/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { GoldActionButton } from "@/components/common/GoldButton";
import { SiteHeader } from "@/components/common/Header";
import { atlasArt, type AtlasCategory } from "@/constants/events";
import { ASSETS } from "@/constants/assets";
import { saveAtlasSpot } from "./atlas/atlas-spot";
import { mountAtlas } from "./atlas/engine";
import { MobileEventsAtlas } from "./MobileEventsAtlas";
import "@/styles/events-atlas.css";

const phoneQuery = "(max-width: 1024px)";
const subscribePhone = (notify: () => void) => {
  const media = window.matchMedia(phoneQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const phoneSnapshot = () => window.matchMedia(phoneQuery).matches;
const serverSnapshot = () => false;

/**
 * /events: the Events Atlas. Seven category worlds orbit an eclipse; choosing
 * one dives into its world of event planets. Static markup lives here; the
 * orbit, transitions and dialogs are driven imperatively by `mountAtlas`.
 * The site header sits outside the atlas root so its scoped styles never
 * reach it.
 */
export function EventsAtlas({ categories }: { categories: AtlasCategory[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const phone = useSyncExternalStore(subscribePhone, phoneSnapshot, serverSnapshot);
  const router = useRouter();
  const eventCount = categories.reduce((n, c) => n + c.events.length, 0);

  const discover = useCallback((category: string, event: string) => {
    saveAtlasSpot({ category, event });
    router.push(`/events/${event}`);
  }, [router]);

  useEffect(() => {
    // Keep the desktop engine and markup unchanged. Never start it on phones,
    // including the first hydration pass before the media store synchronizes.
    if (phone || window.matchMedia(phoneQuery).matches || !rootRef.current) return;
    return mountAtlas(rootRef.current, { categories, onDiscover: discover });
  }, [phone, categories, discover]);

  if (phone) return <><SiteHeader /><MobileEventsAtlas categories={categories} eventCount={eventCount} onDiscover={discover} /></>;

  return (
    <>
      <SiteHeader />
      <div ref={rootRef} className="events-atlas select-none" data-mode="atlas" data-intro="pending">
        <div className="sky" aria-hidden>
          <div
            className="sky-texture"
            style={
              ASSETS.cloudinary.eventsBackground
                ? { backgroundImage: `url(${ASSETS.cloudinary.eventsBackground})` }
                : undefined
            }
          />
          <img className="dust" src={atlasArt.shared("gold-dust")} alt="" draggable={false} />
          <div className="vignette" />
        </div>

        <main id="main" tabIndex={-1}>
          <section id="overview" aria-label="Choose an event category">
            <div className="intro">
              <p className="eyebrow">THE EVENTS ATLAS</p>
              <h1>
                Every art,
                <br />a <em className="font-nasyhama font-normal italic text-gold">universe</em>.
              </h1>
              <p className="intro-note">
                <span className="hint-pointer">Drag to rotate.</span>
                <span className="hint-touch">Swipe to turn.</span>
              </p>
              <button className="intro-link" id="browse-bottom">
                View all {eventCount} events <span aria-hidden>→</span>
              </button>
            </div>
            <div id="atlas-camera">
              <div id="category-worlds" />
            </div>
            {/* Bottom figures matching loader: veena on bottom-left, mudra hand on bottom-right */}
            <div className="atlas-figures" aria-hidden="true">
              <img
                src={ASSETS.cloudinary.veena}
                alt=""
                draggable={false}
                className="atlas-figure atlas-figure--veena"
              />
              <img
                src={ASSETS.cloudinary.hand}
                alt=""
                draggable={false}
                className="atlas-figure atlas-figure--hand"
              />
            </div>
          </section>

          <section id="event-scene" aria-label="Explore category events" hidden inert>
            <div className="event-breadcrumb">
              <button id="back">
                <span aria-hidden>←</span> All categories
              </button>
              <span className="breadcrumb-rule" />
              <span id="breadcrumb" />
            </div>
            <img className="immersive-corona" src={atlasArt.shared("corona-halo")} alt="" aria-hidden draggable={false} />
            <div id="planet-system" />
            <div className="event-copy" id="event-copy" aria-live="polite" aria-atomic="true">
              <p className="eyebrow" id="world-label" />
              <p className="category-line" id="category-line" />
              <h1 id="event-title" />
              <p id="event-description" />
              <div className="event-meta">
                <span id="event-kind" />
                <span id="event-counter" />
              </div>
              <GoldActionButton variant="ghost" className="atlas-cta" id="discover">
                Discover event
              </GoldActionButton>
            </div>
            <nav className="event-progress" id="event-progress" aria-label="Events in this category" />
            <div className="event-bottom">
              <nav className="category-dock" id="category-dock" aria-label="Switch category" />
              <div className="journey-controls">
                <button id="previous" aria-label="Previous event">
                  ←
                </button>
                <span id="journey-label" />
                <button id="next" aria-label="Next event">
                  →
                </button>
              </div>
            </div>
          </section>
          <div id="scroll-track" aria-hidden />
        </main>

        <dialog id="directory" className="directory">
          <div className="dialog-heading">
            <div>
              <p className="eyebrow">ALL SEVEN WORLDS</p>
              <h2>Find your stage.</h2>
            </div>
            <button className="close-button" data-close="directory" aria-label="Close event directory">
              ×
            </button>
          </div>
          <label className="search-label" htmlFor="event-search">
            Search events or categories
          </label>
          <input id="event-search" type="search" placeholder="A voice, a canvas, a world…" autoComplete="off" />
          <div className="directory-filters" id="directory-filters" aria-label="Filter by category" />
          {/* Fixed-height body: filtering never resizes the dialog. */}
          <div className="directory-body">
            <div className="directory-results" id="directory-results" />
            <p className="no-results" id="no-results" hidden>
              No worlds found. Try another search.
            </p>
          </div>
        </dialog>

        {/* Only shown, with a message, if an illustration fails to load. */}
        <div className="load-status" id="load-status" role="status" hidden />
      </div>
    </>
  );
}
