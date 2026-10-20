# Conch Crawl — Bahamas Games

A mobile-first Bahamian pixel-art puzzle. Little animated queen conchs crawl to an image and place matching tiles. 30 levels, progressively denser art, and simple rules.

## Play / deploy

- **`index.html` is the complete, self-contained game.** It has CSS, scripts, all 30 levels, and the queen conch sprite inlined. No install, login, or API required.
- **`play.html` is the editable modular entry point**, loading `styles.css`, `levels.js`, and `game.js`.
- For Cloudflare Pages, choose framework **None**, leave build command blank, and use `/` as the output directory. Deploy only after reviewing settings.
- To test locally, use `python3 -m http.server 8000` and visit `http://localhost:8000/play.html`.

## Rules

1. **All upcoming numbered colour cards remain visible** in three vertically scrollable stacks, so you can plan ahead. Only the **top card** of each stack can be tapped, and its first picture tile must be exposed.
2. Tap an exposed top card; it occupies one of **five holding slots**.
3. A queen conch crawls out and places one matching-colored tile at a time.
4. Each tile reduces the card's count by one. That slot stays occupied until the count reaches zero and the conch returns.
5. **You cannot select a sixth card** while all five slots are full. Slots are reusable when freed.
6. Tap speed to switch between **1×, 2×, and 3×**. Complete the picture to unlock the next level; progress saves in the browser.

Difficulty increases through picture size, detail, tile count and more color variation—not complicated new rules.

## Files

- `index.html` — offline-capable standalone playable version (recommended entry point).
- `play.html`, `styles.css`, `game.js`, `levels.js` — editable website source.
- `levels.json` — all 30 expanded level grids.
- `source-levels.json`, `build_levels.py` — original templates + script that prepares more detailed level grids.
- `tests/` — Playwright smoke and real gameplay-completion tests.

## Verified locally

- Responsive rendering in Chromium at 320×568, 390×844 and 768×1024.
- No JavaScript errors during viewport tests.
- Strict five-conch cap, occupied slots while working, slot release, pixel placement and speed adjustment.
- Normal Level 1 playthrough, victory popup, level unlock and movement to Level 2.
- Levels 15 and 30 render (over 700 and 1,400 tiles respectively).

**Not yet verified:** gameplay on a physical iPhone or a live Cloudflare/GitHub Pages deployment.

Artwork is original, stylized Bahamian-themed pixel art. This is a new game inspired by a genre, not an exact copy of another game's engine.

## Exposed colour rule

Colours completely covered by unfinished outer tiles are not selectable. A queen conch works only from the exposed edge inward; as it finishes the outer outline, new colours become available automatically. Each active colour has one conch so jobs cannot claim the same tiles.

## Visible queues

All future cards are displayed in three scrollable stacks. Preview cards cannot be selected until they reach the top. A top card whose first pixel is still covered remains visible but temporarily disabled. The conch completes a preplanned outside-in delivery path and frees its active slot when finished.
