# LOOPIN — neighborhood share / borrow / lost / found

HTML + CSS + JavaScript only (no framework). Open `index.html` in a browser.

## Files (each page = 1 HTML + 1 CSS + 1 JS)
| Page | HTML | CSS | JS |
|---|---|---|---|
| Shared by all | — | style.css (colors, navbar, buttons, forms, cards, footer) | script.js (sample data, save/read, helpers) |
| Home | index.html | home.css | home.js |
| Share | share.html | share.css | share.js |
| Borrow | borrow.html | borrow.css | borrow.js |
| Lost | lost.html | lost.css | lost.js |
| Found | found.html | found.css | found.js |

Every file starts with a MAP / FIND IT FAST comment. Phone/tablet rules: Ctrl+F `RESPONSIVE`.

## Easy edits
- Change colors / fonts / roundness / shadows: see the value list at the top of `style.css` (section 1), then use Find and Replace (Ctrl+H) in all `.css` files.
- Change sample items: `getSampleBorrowItems()` in `script.js`.
- Change a page photo: replace the file in `images/` (same filename).

## How data is saved
`localStorage` in the browser (+ `JSON.stringify` / `JSON.parse`). Nothing goes to a server;
other browsers/devices do not see your data. Borrow requests do not notify anyone.
Possible matches on the Found page = simple word + category score, not AI.

## Images
All images are original SVG illustrations (one file per place, no repeats). To use a real photo, put it in `images/` and change the file name in the matching CSS / HTML / `script.js` line.

## Viva
See `VIVA_QUESTIONS.md`.

## Update
- Borrow item photos are now original SVG illustrations in images/borrow-items/ (one per item).
- Card design = 'Neighbor Pass' (style.css section 13).
- Share / Borrow / Lost / Found now end with a 3-card guide (`help`) and a call-to-action band (`cta-band`). Borrow also has the 3-step strip. CSS: style.css section 14.
