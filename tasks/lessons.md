# Lessons

## Loader / motion
- Don't restyle brand art (silhouettes, tints) without a visible story reason; user reads it as random. Default: show art in its real colours.
- Opening text must be readable: ≥13px eyebrow / ≥26px display, on screen ≥1s fully visible.
- Text beats share one slot (under the eclipse) so they never collide with the art; check every frame on desktop + phone.
- Verify motion with exact frames (headless Brave + puppeteer, scrub `getAnimations()`), not the in-app pane: its captures go stale.
