# Instructions for Claude

## Project
Personal website of Oier: data scientist and PhD student in the Basque Country. Static site published with GitHub Pages from the `main` branch of this repository (`OierEt/Ebiya-Aidu`). Pushing to `main` publishes within about a minute. Current address: `https://oieret.github.io/Ebiya-Aidu/`.

## How to work with the owner
- He has no web-development background and writes in Spanish. Reply in Spanish, in plain language, without jargon.
- Make the changes yourself: edit the files, commit and push to `main`. Do not tell him to edit code.
- After pushing, say in one or two sentences what changed and where to see it.
- If a request is ambiguous in a way that changes the result (for example, which page a section belongs in), ask one short question. Otherwise decide and say what you decided.

## Structure (do not change without being asked)
- Two languages, same pages: English (main) in the repository root, Basque in `eu/`.
- Four pages per language: `index.html` (Home), `projects.html` (Projects, with a Research section), `about.html` (About me, with Me, Places, Thoughts and Collection sections), `chat.html` (Chat).
- Nav labels. EN: Home, Projects, About me, Chat. EU: Hasiera, Proiektuak, Niri buruz, Txata.
- Shared files: `css/style.css` (all styling), `js/follower.js` (cursor companion), `img/lauburu.svg` (black/cream use), `img/favicon.svg` (red lauburu, also used by the follower).
- No frameworks, no build step, no npm, no analytics or tracking scripts. Allowed external resources: Google Fonts, and one chat embed once the owner provides its code.

## Bilingual rule
- Every text change in an English page must be made in the matching `eu/` page in the same commit, and the other way round.
- Write Basque in standard Basque (Batua). When you add or change Basque text, tell the owner so he can review it.
- Page names and section ids stay identical in both languages (`#projects`, `#research`, `#me`, `#places`, `#thoughts`, `#collection`); only visible text is translated.
- Before pushing, check that both folders have the same pages: `diff <(ls *.html) <(ls eu/*.html | xargs -n1 basename)` must print nothing.

## Adding or changing pages
- Header, nav, language switch and footer are repeated in every HTML file. A nav change must be applied to all 8 files.
- The language switch in each page links to the same page in the other language (`eu/x.html` from the root, `../x.html` from `eu/`).
- A new page is a copy of an existing page of the same language, plus a nav entry in all pages of both languages.
- Check every `href` and `src` resolves to an existing file before pushing.

## Design (values are in `:root` of `css/style.css`; change them there, not inline)
- Colours: cream `#ece3cf`, paper `#f6f0e1`, red `#cf2a1c`, black `#15120f`, green `#1f6b3a`.
- Green is only for tags and the "Kaixo" label. Red is for accents and the page header band. Black is for text, borders and offset shadows.
- Fonts: Anton for headings (uppercase), IBM Plex Sans for body text (17px), IBM Plex Mono only for labels, nav, tags and buttons.
- Components: `.card` (3px black border, 7px offset shadow), `.btn`, `.subnav`, `.list`, `.tags`, `.section-title`.
- Basque identity is subtle: lauburu in header and footer, "Kaixo", the green, the language switch. Never use ikurriña colours as the main palette and never put Basque imagery in the hero.
- Cursor companion (`js/follower.js`): a 30px red lauburu that trails the pointer and rotates with movement. Keep it off for touch devices and `prefers-reduced-motion`. Do not add a second companion or sound.
- Photos: JPEG or WebP, at most 200 KB each, width at most 1200 px, with a meaningful `alt` text.

## Placeholders
- A card or row with class `todo` is a placeholder (dashed border and a "placeholder" label). When the owner supplies the real content, replace the text and remove the `todo` class in both languages.
- Known placeholders: the contact email (`you@example.com` in the About page), project links (`href="#"`), collection items, the Publications box, the Chat box.

## Chat page
The chat is an embedded third-party widget. Do not invent one. When the owner provides an embed code, paste it inside `.chat-box` in both `chat.html` files, remove the `todo` class from that box, and tell him it loads data from a third party.

## Do not publish without asking
- Real data from his employer or students; dashboards show only anonymised or invented examples.
- The newsletter tool and the possible Tartu research stay.
- His exact location or contact details beyond what he approves.

## Commits
One commit per request, message in English, imperative mood, first line under 70 characters.
