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
- Four pages per language: `index.html` (Home), `projects.html` (Projects, with a Research section), `about.html` (About me, with Me, Places, Thoughts and Collection sections), `chat.html` (Chat).
- Nav labels. EN: Home, Projects, About me, Chat. EU: Hasiera, Proiektuak, Niri buruz, Txata.
- Shared files: `css/style.css` (all styling), `js/follower.js` (wandering lauburu), `js/nav.js` (sub-menu highlight and tab title), `js/chat.js` (chat page only), `backend/chat-setup.sql` (chat database), `img/lauburu.svg` (black/cream use), `img/favicon.svg` (red lauburu, also used by the follower).
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
- Wandering lauburu (`js/follower.js`): a 28px red lauburu that roams the window on its own in smooth curves, rests now and then and rotates slowly. It must ignore the mouse completely (never follow, approach or flee from it). Off for `prefers-reduced-motion`. Do not add a second creature or sound. Speed and rest times are constants at the top of the file.
- The sub-menu (`.subnav`) is sticky and shows the current section; section ids must match the `href`s in it.
- Photos: JPEG or WebP, at most 200 KB each, width at most 1200 px, with a meaningful `alt` text.

## Placeholders
- A card or row with class `todo` is a placeholder (dashed border and a "placeholder" label). When the owner supplies the real content, replace the text and remove the `todo` class in both languages.
- Known placeholders: the contact email (`you@example.com` in the About page), project links (`href="#"`), collection items, the Publications box, and the Chat box until the chat is connected.

## Chat page
- Public chat: visitors choose an alias (max 24 characters) and write a message (max 500). The owner's alias "Ebiya Aidu" is reserved: it is blocked in `js/chat.js` and, for real, in the database rules of `backend/chat-setup.sql` (any alias that contains "ebiyaaidu" after removing accents, case and symbols).
- Storage is a Supabase project (EU region) reached through its REST API with plain `fetch`; no library. `CHAT_URL` and `CHAT_KEY` at the top of `js/chat.js` are empty until the owner creates the project. While empty, the page shows "The chat is not connected yet." The key to use is the public anon/publishable key, never the secret `service_role` key.
- The owner answers and moderates from the Supabase Table Editor: reply = insert a row with alias `Ebiya Aidu` and `is_owner = true`; delete a message = delete its row.
- Messages are always rendered with `textContent`, never `innerHTML`. Keep it that way.
- The page tells visitors not to share personal data. If a privacy notice is needed later, add it to this page in both languages.

## Do not publish without asking
- Real data from his employer or students; dashboards show only anonymised or invented examples.
- The newsletter tool and the possible Tartu research stay.
- His exact location or contact details beyond what he approves.

## Commits
One commit per request, message in English, imperative mood, first line under 70 characters.
