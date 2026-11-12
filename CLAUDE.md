# Instructions for Claude

## Project
Personal website of Oier, published under the alias "Ebiya Aidu". Data scientist and PhD student in the Basque Country.

**Site name: "Ebiya Aidu"** (header, hero, footer, tab titles). Do not use "Oier", "Oier's garden" or any name-based title for the site: the owner does not want it to feel egocentric. Tab titles are `Page · Ebiya Aidu`, and on pages with sub-sections `js/nav.js` adds the current sub-section (`Research · Projects · Ebiya Aidu`). Static site published with GitHub Pages from the `main` branch of this repository (`OierEt/Ebiya-Aidu`). Pushing to `main` publishes within about a minute. Current address: `https://oieret.github.io/Ebiya-Aidu/`.

## How to work with the owner
- He has no web-development background and writes in Spanish. Reply in Spanish, in plain language, without jargon.
- Make the changes yourself: edit the files, commit and push to `main`. Do not tell him to edit code.
- After pushing, say in one or two sentences what changed and where to see it.
- If a request is ambiguous in a way that changes the result (for example, which page a section belongs in), ask one short question. Otherwise decide and say what you decided.

## Structure (do not change without being asked)
- Two languages, same pages: English (main) in the repository root, Basque in `eu/`.
- Home layout, top to bottom: hero (name, intro, two buttons), word band (`.marquee`), Selected work (3 cards linking to `projects.html#projects`), What I do (`.trio`), Where to go, About this site. Keep the three Selected work cards in sync with real projects.
- Four pages per language: `index.html` (Home), `projects.html` (Projects, with a Research section), `about.html` (About me, with Me, Places, Thoughts and Collection sections), `chat.html` (Chat).
- Nav labels. EN: Home, Projects, About me, Chat. EU: Hasiera, Proiektuak, Niri buruz, Txata.
- Shared files: `css/style.css` (all styling), `js/lauburu.js` (wandering lauburu, basket and score), `js/theme.js` (style switcher, loaded in `<head>`), `js/nav.js` (sub-menu highlight and tab title), `js/chat.js` and `backend/chat-setup.sql` (chat, currently paused, see Chat page), `img/lauburu.svg` (black/cream use), `img/favicon.svg` (red lauburu used as favicon; the roaming lauburu is inline SVG inside `js/lauburu.js`).
- No frameworks, no build step, no npm, no analytics or tracking scripts. Allowed external resources: Google Fonts, and the Supabase REST API once the chat is reactivated.

## Bilingual rule
- Every text change in an English page must be made in the matching `eu/` page in the same commit, and the other way round.
- Write Basque in standard Basque (Batua). When you add or change Basque text, tell the owner so he can review it.
- Page names and section ids stay identical in both languages (`#projects`, `#research`, `#me`, `#places`, `#thoughts`, `#collection`); only visible text is translated.
- Before pushing, check that both folders have the same pages: `diff <(ls *.html) <(ls eu/*.html | xargs -n1 basename)` must print nothing.

## Adding or changing pages
- **Cache busting (mandatory):** every HTML file loads `css/style.css`, `js/theme.js`, `js/lauburu.js` and `js/nav.js` with `?v=<version>`. GitHub Pages lets browsers cache files for about 10 minutes, so without a new version the visitor can get new HTML with an old CSS or JS and the site looks broken (this already happened once). Whenever any CSS or JS file changes, set a new version in all 8 HTML files: `sed -i -E 's/\?v=[0-9a-z]+/?v=NEWVERSION/g' *.html eu/*.html`.
- Header, nav, language switch and footer are repeated in every HTML file. A nav change must be applied to all 8 files.
- The language switch in each page links to the same page in the other language (`eu/x.html` from the root, `../x.html` from `eu/`).
- A new page is a copy of an existing page of the same language, plus a nav entry in all pages of both languages.
- Check every `href` and `src` resolves to an existing file before pushing.

## Design (values are in `:root` of `css/style.css`; change them there, not inline)
- Colours of the default (archive) style: cream `#e6d9bb`, paper `#f0e7cf`, rust `#8e3a22` (in the variable `--red`), black `#2a2116`, green `#556b2f`. Headings use IBM Plex Mono. The other styles' values are in the `html[data-theme=...]` blocks.
- Green is only for tags and the "Kaixo" label. Red is for accents and the page header band. Black is for text, borders and offset shadows.
- Fonts: headings uppercase in `var(--head)` (IBM Plex Mono in the archive style, Anton in the others), IBM Plex Sans for body text (17px), IBM Plex Mono only for labels, nav, tags and buttons.
- Components: `.card` (3px black border, 7px offset shadow), `.btn`, `.subnav`, `.list`, `.tags`, `.section-title`.
- Basque identity is subtle: lauburu in header and footer, "Kaixo", the green, the language switch. Never use ikurriña colours as the main palette and never put Basque imagery in the hero.
- Wandering lauburu (`js/lauburu.js`): a 28px lauburu in the accent colour that roams the window on its own in smooth curves, rests now and then and rotates slowly. It ignores the mouse until it is grabbed. With `prefers-reduced-motion` it never moves by itself but can still be grabbed and thrown. Do not add a second creature or sound. Tuning constants are at the top of the file.
- Basket game (same file): the visitor can grab the lauburu (pointer events, works with touch), drag and throw it. A hoop (`.hoop`) is fixed at the right edge at 36vh and a score box (`.score`) at the bottom right; both are created by the script, not written in the HTML. A basket from far (distance greater than max(300px, 35% of window width)) counts 3, otherwise 2. The score is kept in `localStorage` (`lauburuScore`); the visitor can hide the hoop with the button in the score box. Gravity, bounce and throw limits are constants at the top. Before changing the physics, test it in a real browser (for example puppeteer-core with the installed Chrome) by throwing the ball and checking that near shots score 2, far shots score 3 and weak throws score nothing.
- Styles: four looks selectable from the footer (archive = default, chosen by the owner; constructivist, coast and notebook are alternatives), implemented in `js/theme.js` and in the `html[data-theme="..."]` blocks at the end of `css/style.css`. They only override the CSS variables plus a few shapes. New components must use the variables (`var(--red)` etc.) so they work in all four. The colour list below describes the default style.
- The sub-menu (`.subnav`) is sticky and shows the current section; section ids must match the `href`s in it.
- Photos: JPEG or WebP, at most 200 KB each, width at most 1200 px, with a meaningful `alt` text.

## Placeholders
- A card or row with class `todo` is a placeholder (dashed border and a "placeholder" label). When the owner supplies the real content, replace the text and remove the `todo` class in both languages.
- Known placeholders: the contact email (`you@example.com` in the About page), project links (`href="#"`), collection items, the Publications box, (the Chat page is a "Coming soon" notice, not a placeholder).

## Chat page
- Status: **paused**. The page shows "Coming soon" / "Laster" in both languages. The owner wants to come back to it later.
- Dormant pieces kept for later: `js/chat.js` (not loaded by any page) and `backend/chat-setup.sql`. Design when reactivated: public chat where visitors choose an alias (max 24 characters) and write a message (max 500); the owner's alias "Ebiya Aidu" is reserved in the browser and, for real, in the database rules; storage in a Supabase project (EU region) through its REST API with plain `fetch`; `CHAT_URL` and `CHAT_KEY` (public anon/publishable key, never `service_role`) at the top of `js/chat.js`; the owner answers and moderates from the Supabase Table Editor (insert a row with alias `Ebiya Aidu` and `is_owner = true`); messages are rendered with `textContent` only.
- To reactivate: add the form markup (alias, message, hidden honeypot field `website`, status line, message list `#chat-list`) and `<script src="js/chat.js">` to both `chat.html` files, remove the "Coming soon" card, add a privacy notice, and test against the real database before announcing it. Also change the "Coming soon." text of the Chat card on both home pages.

## Do not publish without asking
- Real data from his employer or students; dashboards show only anonymised or invented examples.
- The newsletter tool and the possible Tartu research stay.
- His exact location or contact details beyond what he approves.

## Commits
One commit per request, message in English, imperative mood, first line under 70 characters.
