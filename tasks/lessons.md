# Lessons

## Pattern

- Mistake: Assumed “second section” meant the stats panel without checking the requested visual destination.
- Rule: Use the user’s screenshot or explicit destination as the source of truth for UI navigation targets.

## Loader / motion
- Don't restyle brand art (silhouettes, tints) without a visible story reason; user reads it as random. Default: show art in its real colours.
- Opening text must be readable: ≥13px eyebrow / ≥26px display, on screen ≥1s fully visible.
- Text beats share one slot (under the eclipse) so they never collide with the art; check every frame on desktop + phone.
- Size key text for desktop too, not just phone: fill the space available (wordmark ~450px at 1280×800).
- Verify motion with exact frames (headless Brave + puppeteer, scrub `getAnimations()`), not the in-app pane: its captures go stale.
