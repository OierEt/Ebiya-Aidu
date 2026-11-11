# Context for Claude (read this first)

Personal website of Oier (data scientist, PhD student, Basque Country). The owner has no web-development background and speaks Spanish; the site itself is in English. Explain things simply, in Spanish, and make the changes yourself rather than telling him how.

## How the site works
- Plain static HTML + CSS, no build step, no framework. Hosted on GitHub Pages: pushing to the main branch publishes it within a minute.
- Pages: index, projects, research, collection, places, notes (`*.html`). All styling is in `css/style.css`. Images go in `img/`.
- The header, nav and footer are repeated in every page. When adding a page or changing the nav, update all pages.
- Cards with class `todo` are placeholders (dashed border + "placeholder" tag). Remove `todo` once the content is real.

## Design rules
- Constructivist look: cream `#ece3cf`, red `#cf2a1c`, black `#15120f`, with a small dark green `#1f6b3a` only for tags and the "Kaixo" label. Headings in Anton, body in IBM Plex Mono.
- Basque influence must stay subtle: the lauburu (`img/lauburu.svg`) in header/footer, "Kaixo", the green. Do not make it the main theme.
- Keep it light: no frameworks, no heavy images (compress photos before adding them).

## Things not to publish without asking
- Real data from his employer or students (dashboards must show only anonymised or invented examples).
- The newsletter tool and the possible Tartu research stay.
- Exact location or personal contact details beyond what he approves.

## Inspiration
Structure inspired by anita.garden. Do not copy its code or content (no licence).
