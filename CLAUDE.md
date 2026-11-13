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
- Shared files: `css/style.css` (all styling), `js/lauburu.js` (wandering lauburu, basket and score), `js/theme.js` (style switcher, loaded in `<head>`), `js/nav.js` (sub-menu / side-menu highlight and tab title), `js/preview.js` (raw-data preview on the project page), `js/chat.js` and `backend/chat-setup.sql` (chat, currently paused, see Chat page), `img/lauburu.svg` (black/cream use), `img/favicon.svg` (red lauburu used as favicon; the roaming lauburu is inline SVG inside `js/lauburu.js`).
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
- Dated project cards (`projects.html`) carry a `<span class="year">` before the `<h3>` (small boxed year in the top-right corner); placeholder cards have none. The hero buttons on Home are paper-coloured and turn red only on hover.
- Components: `.card` (3px black border, 7px offset shadow), `.btn`, `.subnav`, `.list`, `.tags`, `.section-title`.
- Basque identity is subtle: lauburu in header and footer, "Kaixo", the green, the language switch. Never use ikurriña colours as the main palette and never put Basque imagery in the hero.
- Wandering lauburu (`js/lauburu.js`): a 28px lauburu in the accent colour that roams the window on its own in smooth curves, rests now and then and rotates slowly. It ignores the mouse until it is grabbed. With `prefers-reduced-motion` it never moves by itself but can still be grabbed and thrown. Do not add a second creature or sound. Tuning constants are at the top of the file.
- Basket game (same file): the visitor can grab the lauburu (pointer events, works with touch), drag and throw it. A hoop (`.hoop`) is fixed at the right edge at 36vh and a score box (`.score`) at the bottom right; both are created by the script, not written in the HTML. A basket from far (distance greater than max(300px, 35% of window width)) counts 3, otherwise 2. The score is kept in `localStorage` (`lauburuScore`); the visitor can hide the hoop with the button in the score box. Gravity, bounce and throw limits are constants at the top. Before changing the physics, test it in a real browser (for example puppeteer-core with the installed Chrome) by throwing the ball and checking that near shots score 2, far shots score 3 and weak throws score nothing.
- Styles: four looks selectable from the footer (archive = default, chosen by the owner; constructivist, coast and notebook are alternatives), implemented in `js/theme.js` and in the `html[data-theme="..."]` blocks at the end of `css/style.css`. They only override the CSS variables plus a few shapes. New components must use the variables (`var(--red)` etc.) so they work in all four. The colour list below describes the default style.
- The sub-menu (`.subnav`) is sticky and shows the current section; section ids must match the `href`s in it.
- Photos: JPEG or WebP, at most 200 KB each, width at most 1200 px, with a meaningful `alt` text.

## Project pages (`breast-cancer-survival.html`, `lung-adenocarcinoma.html`, `drunk-driving-laws.html` and `zeolite-iron-adsorption.html`, same in `eu/`)
- Edit these pages by hand from now on; they were generated once and have no generator.
- Layout: `.wrap.wide` (full width), `.proj` grid with a sticky side menu `.toc` on the left and `.report` on the right. `js/nav.js` highlights the current entry and opens the sub-items (`li.l2[data-group]`) of the current section only.
- The report body is the original English university report (code in collapsed `details.code`, outputs in `pre.out`). It stays in English in both languages; only the surrounding text is translated. Personal name, local paths and the course server link are removed on purpose.
- Owner's notes: add `<aside class="my-note"><div class="my-note-label">My note</div><p>...</p></aside>` (Basque: "Nire oharra") right after the report passage it comments on, in both languages. Remove the `todo` class once real text is in. Notes must stay visually distinct from the report (red border).
- `.summary` boxes (Results at a glance) are added by the site, not part of the original report.
- Data section: the preview (first 10 patients, 21 columns) is filled by `js/preview.js` from `data/breast-cancer-preview.csv`; the download card sits below it and links to the files of the GitHub release tagged `data` (`.Rdata` and three `.xlsx`, kept out of the repository because of the 100 MB limit). If a release file is renamed, update the links in both languages. The owner confirmed the data may be published.

- Lung adenocarcinoma page: it holds the final version of the university report (a complete one; an earlier unfinished draft was replaced). The only text not from the original is the `<aside class="added review">` block in 3.2 (black label "Review · written with Claude", about the `==` instead of `%in%` filter); keep it visually distinct from the original and from the owner's `my-note` blocks. Authorship (co-author, name) is intentionally not shown; the owner will edit it. His Context note is in his own words. The six other `my-note` blocks in the report (2.2, 2.3, 3.1, 3.2, 3.3, Conclusions) were drafted by Claude in the owner's voice at his request; he will edit them. The cBioPortal and GDC links in its Data section could not be tested from the build environment.

- Drunk driving laws page: the 2020 Biostatistics report (complete, in Spanish; it stays in Spanish in both languages, `section#report-wrap lang="es"`). Author name and the local path were removed. It has five `my-note` blocks (laws-evolution, mean-evolution, multiple-regression, simple-by-law, logistic-general) drafted by Claude in the owner's voice, which he will edit, and two `added review` blocks written by Claude (in kruskal-test: the ANOVA/Kruskal tests use 28 yearly group averages, not the 336 rows; in multiple-regression: sections 3-4 treat 48 states x 7 years as independent). Its Context note is still a placeholder (`my-note todo`, "Context note to come."). The Data link (Rdatasets/Ecdat `Fatality` description) could not be tested from the build environment.
- Zeolite iron adsorption page: the 2022 Biomedical Engineering internship report (Spanish, built from a PDF: text, equations written in Unicode as `p.eq`, tables, 10 figures/photos, R code in the appendix). It has no Data section (lab data, no public dataset). Removed on purpose: his name, the supervisor's name, the cover logos. The report text still names the institutions where the work was done (Miramón lab of the University of Navarra, and CEIT); the owner can ask to remove them. Four `added review` blocks written by Claude (introduction: iron limit 0.02 vs 0.2 mg/L; phenanthroline method: unit slip µl/L; calibration: choice of fit; phenanthroline results: four assays, noise). Context note is a placeholder (`my-note todo`).
- Ovarian cancer (GSE29156, limma) has a card in `projects.html` without a link ("Details coming soon" / "Xehetasunak laster"): the page is not built yet because there is no rendered report. When it exists, build the page and turn that text into a `Details` link in both languages.

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
