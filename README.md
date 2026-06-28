# Premier Schools Exhibition (PSE) — Landing Page

A pixel-faithful, fully responsive, and WCAG 2.2 AA–accessible landing page for the
**Premier Schools Exhibition**, built to the supplied Figma design.

Built with **semantic HTML5 + custom CSS only — no frameworks, no build step.**
JavaScript is vanilla (no dependencies). Just open `index.html` in a browser.

---

## How to run

No installation or build is required.

**Option A — open directly**
Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).

**Option B — local server (recommended, avoids `file://` quirks)**
```bash
# from the project root
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## Project structure

```
premier-schools-exhibition/
├── index.html              # Single-page semantic markup (BEM, ARIA, skip-link)
├── README.md
├── css/
│   ├── variables.css       # Design tokens: colour palette, gradients, type scale, motion vars
│   ├── base.css            # Reset, typography, .container, helpers (.visually-hidden, .skip-link), buttons
│   ├── components.css      # All section/component styles + keyframes + prefers-reduced-motion block
│   └── responsive.css      # Breakpoints (1024 / 768 / 520px) + mobile slider conversions + hover:none
├── js/
│   └── main.js             # Vanilla IIFE modules: hero dual-axis gallery, marquee, choose slider, exhibition slider
└── assets/
    └── images/             # SVG placeholder assets (see note below)
```

---

## Section-by-section implementation

| Section | Behaviour |
|---|---|
| **Header** | Logo + "Register Now" CTA. Becomes compact on scroll. |
| **Hero** | **Dual-axis slider** — vertical auto-scrolling photo columns (alternating up/down) **and** horizontal paging via prev/next buttons, pointer **swipe/drag**, and **arrow keys**. Includes an accessible **pause/play toggle** (`aria-pressed`), **pause-on-hover/focus**, and starts paused under reduced-motion. Right side holds the "Enquire Now" form. |
| **Stats bar** | Laurel stat items as a semantic list. |
| **Participating Schools** | **Continuous marquee** with **alternating LTR / RTL** rows; **pauses on hover/focus**; duplicate row marked `aria-hidden`. |
| **Choose the School** | 4 cards on desktop → horizontal **swipe slider with pagination dots** on mobile (≤768px); track is a focusable, labelled scroll region. |
| **Pre-schedule** | Promo band with CTA + image. |
| **What Makes This a Must-Visit** | Entire section is an **accessible card slider** (5 cards, consistent height, prev/next + swipe, optional autoplay). |
| **Footer** | Office addresses, phone links, social links. |

---

## Accessibility (WCAG 2.2 AA)

- **Skip-to-content** link as the first focusable element.
- Semantic landmarks (`header`, `main`, `section`, `footer`) and a logical heading order.
- All sliders expose **keyboard control** (arrow keys / Tab) and **ARIA** labelling; carousel controls are real `<button>`s with discernible names.
- **`prefers-reduced-motion`** is honoured throughout — all auto-motion (hero scroll, marquee, autoplay) stops, and the hero starts paused.
- Touch targets meet the **24×24 CSS px** minimum (WCAG 2.2 *Target Size (Minimum)*).
- Verified with **axe-core 4.10**: **0 violations** at 1440px, 768px, and 390px.

## Conventions

- **BEM** naming throughout (`block__element--modifier`).
- CSS organised tokens → base → components → responsive.
- Colours, spacing, and type driven by custom properties in `variables.css` for easy theming.

---

## ⚠️ Note on image assets

The files in `assets/images/` are **lightweight SVG placeholders** generated to match the
layout, proportions, and colour story of the design. They are **intended to be swapped for
the real exported assets** (student photos, school logos, exhibition photos, the PSE logo)
from the Figma file. Because every `<img>` already carries correct `width`/`height` and
`alt` text, replacing a placeholder is a one-to-one file swap — no markup changes needed.
