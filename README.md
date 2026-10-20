# Conch Crawl — Bahamas Games

A mobile-first Bahamian pixel-art puzzle. Little animated queen conchs crawl to an image and place matching tiles. 30 levels, progressively denser art, and simple rules.

## Play / deploy

- **`index.html` is the complete, self-contained game.** It has CSS, scripts, all 30 levels, and the queen conch sprite inlined. No install, login, or API required.
- **`play.html` is the editable modular entry point**, loading `styles.css`, `levels.js`, and `game.js`.
- For Cloudflare Pages, choose framework **None**, leave build command blank, and use `/` as the output directory. Deploy only after reviewing settings.
- To test locally, use `python3 -m http.server 8000` and visit `http://localhost:8000/play.html`.

## Rules

1. Tap a numbered color card; it occupies one of **five holding slots**.
2. A queen conch crawls out and places one matching-colored tile at a time.
3. Each tile reduces the card's count by one. That slot stays occupied until the count reaches zero and the conch returns.
4. **You cannot select a sixth card** while all five slots are full. Slots are reusable when freed.
5. Tap speed to switch between **1×, 2×, and 3×**. Complete the picture to unlock the next level; progress saves in the browser.

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
