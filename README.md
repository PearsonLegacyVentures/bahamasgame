# Conch Crawl — Bahamas Games

An original Bahamian pixel-fill puzzle with animated queen conch workers, 30 levels, visible future color queues, linked two-color blocks, and five reusable conch slots.

## Play and deploy

- **`index.html`** is the complete self-contained version for Cloudflare Pages. No build or API needed.
- **`play.html`**, `styles.css`, `game.js`, and `levels.js` are editable source files.
- Cloudflare Pages: framework **None**, no build command, output directory `/`.
- Local test: `python3 -m http.server 8000`, then visit `http://localhost:8000/play.html`.

## Rules

1. All upcoming numbered color blocks remain visible beneath their stack's first card. Scroll to see future blocks.
2. **Only the top block in each stack can be selected**, and it must have an exposed tile on the artwork. Enclosed colors become available only as outer layers are completed.
3. Every selection reserves a holding slot and starts a crawling queen conch, which places tiles one at a time. A slot is released after that block's count reaches zero.
4. **Linked double-choice blocks** (introduced in Level 8) are connected visually. Tapping either one selects **both together**, starts **two conchs**, and requires **two free holding slots**. The conchs complete independently and release their own slots.
5. There are always **five holding slots**, even on advanced levels. Players cannot start more work than the available slots allow.
6. Levels 1–11 use **three preview stacks**. Levels 12–30 use **four stacks**, matching the reference's advanced queue layout.
7. Speed cycles through 1×, 2×, and 3×. Level progress is saved locally in the browser.

Difficulty increases primarily with the size, colors, and pixel detail of the Bahamian scenes, not additional rules.

## Files

- `index.html`: complete no-dependencies release file.
- `play.html`, `styles.css`, `game.js`, `levels.js`: modular sources.
- `levels.json`, `source-levels.json`, `build_levels.py`: level sources and art generation.
- `tests/smoke_test.py`, `tests/end_to_end.py`, `tests/linked_pairs.py`: browser checks.

## Testing

Verified in Chromium at 320×568, 390×844 and 768×1024, including Level 20 pair selection. All 30 levels passed card-count and pair-integrity checks, and a real Level 20 double choice reserved two holding slots and delivered tiles without JavaScript errors. This is **not** a claim of testing the live deployed website or a physical iPhone.

Art and queen conch sprites are original, stylized Bahamian interpretations, not extracted content from the reference game recording.