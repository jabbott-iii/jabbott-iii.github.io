# Writing and front-end standards

These rules cover everything written in this repository: posts in `_posts/`, page copy, `README.md`,
`_data/*.yml`, `llms.txt`, HTML, CSS, JavaScript, code comments, and commit messages.

Apply them to text and code you write or edit. Apart from spelling (see below), don't rewrite
existing posts or files only to make them conform; fix a passage when you are already changing it.

## English: spelling and word choice

- Use American English, never British English. It matches `lang: en-US` in `_config.yml`.
  - Spelling: -or not -our (behavior, color), -ize and -ization not -ise and -isation (optimize,
    normalization), -yze not -yse (analyze), -er not -re (center), "license" for both noun and
    verb, a single "l" before suffixes (canceled, labeled, modeling), "gray", "catalog",
    "judgment".
  - Words: "toward", "among", "while", "learned", and "percent", not "towards", "amongst",
    "whilst", "learnt", or "per cent".
  - This spelling rule applies to existing text too. When you see a British spelling in prose,
    comments, or data, correct it. Leave identifiers, CSS keywords (`forwards`), quoted
    names, and URLs exactly as they are.
- Spell names the way their owners do: GitHub, JavaScript, TypeScript, Node.js, macOS, iOS, Linux,
  Windows, PostgreSQL, SQLite, Kubernetes, Docker, npm, crates.io, OpenGL, Wayland, X11,
  Cloudflare, LinkedIn. Spell project names as they appear in `_data/projects.yml`.
- Watch these common errors: its/it's, their/there/they're, affect/effect, then/than, lose/loose,
  lead/led, principal/principle, complement/compliment, ensure/insure.
- Use the one-word form for a noun and the two-word form for a verb: "the setup" but "set up
  the server". The same goes for login/log in, backup/back up, checkout/check out,
  shutdown/shut down, and rollout/roll out.
- Hyphenate a compound modifier before a noun ("a zero-dependency engine", "an open-source tool")
  but not after it ("the engine has zero dependencies", "the tool is open source"). Don't
  hyphenate after an "-ly" adverb ("a fully signed binary").
- Use "front end" and "back end" as nouns and "front-end" and "back-end" as adjectives.
- Prefer plain words: "use" (not "utilize" or "leverage"), "to" (not "in order to"), "because"
  (not "due to the fact that"), "for example" (not "e.g."), "that is" (not "i.e."), "about" (not
  "approximately").
- Cut filler and hedges: "basically", "simply", "just", "very", "really", "actually", "quite".
  Don't call something "easy" or "simple"; the reader decides that.
- Don't use marketing language without evidence: "blazing fast", "seamless", "robust",
  "cutting-edge", "revolutionary". State the measurement instead.
- Use inclusive, literal terms: allowlist/denylist, primary/replica, placeholder (not "dummy"),
  "quick check" (not "sanity check"), "they" for a person whose pronouns you don't know.

## English: grammar and punctuation

- Write in the active voice and present tense: "The cook writes a pack file", not "A pack file
  will be written by the cook". Use the passive only when the actor is unknown or doesn't matter.
- Keep one idea per sentence, and split sentences longer than about 25 words.
- Use the serial (Oxford) comma: "Windows, macOS, and Linux". It removes ambiguity in long
  technical lists. Older posts omit it; don't change them just to add it.
- Keep lists parallel: every item starts with the same part of speech. Items that are full
  sentences end with a period; fragments don't. Don't mix the two in one list.
- Make every pronoun's referent clear. Write "This change breaks the cache", not "This breaks the
  cache", when the previous sentence holds more than one noun.
- Dashes:
  - Use an em dash (—) with no spaces for a break in a sentence.
  - Use an en dash (–) for ranges: "2–4 MB", "Monday–Friday".
  - Use a hyphen (-) only inside compound words.
  - Use a colon, not a spaced hyphen, between a title and a subtitle: "Capsus v1.0.0: Now
    Archived".
- In American prose, periods and commas go inside closing quotation marks. When the exact
  characters matter (a command, a value, a key), use code formatting so the punctuation stays
  outside it.
- Contractions such as "it's", "don't", and "isn't" are fine in posts. Leave them out of the
  resume, and avoid awkward ones like "it'll" or "should've".
- Capitalization:
  - Front matter `title`: title case ("Nadir Deep Dive: Architecture of a Zero-Dependency 2D
    Engine").
  - Headings and the leading `#` sub-headline in a post: sentence case ("What ships today").
  - Text the design shows in capitals: write it in normal case and let CSS `text-transform` do
    the uppercasing. Screen readers may spell out text typed in capitals letter by letter.

## English: numbers, dates, and units

- In prose, spell out zero through nine and use numerals from 10 up. Always use numerals for
  versions, measurements, percentages, sizes, counts in tables, and anything technical.
- Put a space between a number and its unit: "16 MB", "60 Hz", "4 ms", "500 ms". Don't add a
  space before "%" or "°". Use the standard symbols: ms, s, KB, MB, GB, fps, px.
- Use thousands separators in prose ("10,000 sprites") but never in versions, years, ports, or
  code.
- Write versions with a "v" when they name a release ("v1.2.0") and match the project's own tags.
- Dates in prose: "November 7, 2026". Dates in front matter, file names, data, and `datetime`
  attributes: ISO 8601 ("2026-11-07"), with a time zone offset when there is a time.

## Technical writing

### Audience and readability

The audience ranges from college students and junior engineers to senior engineers. Write so a
student can follow every sentence and a senior engineer finds nothing vague or wrong. Make the
text as readable as possible without losing any of its meaning.

- Assume the reader can program and has used Git and a terminal, but doesn't know this project
  or its specialty (graphics, cryptography, cloud infrastructure, and so on). Don't explain
  programming basics such as variables, loops, or functions.
- Keep jargon to a minimum:
  - Use a plain phrase when it says the same thing just as exactly: "runs at the same time",
    not "is concurrent", unless the distinction matters.
  - Use a technical term only when it carries meaning that a plain phrase can't, or when the
    reader needs the term to search for it, read the docs, or use the tool.
- Explain each technical term a student might not know the first time it appears. A short
  clause or a few words in parentheses are usually enough: "a spatial hash (a grid that sorts
  objects by position, so nearby objects can be found quickly)". After that, use the term
  without explaining it again.
- Spell out every acronym on first use, followed by the acronym in parentheses: "entity component
  system (ECS)". Skip this only for universal ones: HTML, CSS, API, URL, CLI, OS, CPU, GPU.
- Never trade accuracy for simplicity:
  - Keep the exact number, the real limit, the correct term, and every condition or caveat
    that changes the meaning.
  - If a simpler sentence would be wrong or misleading, keep the precise wording and add an
    explanation next to it.
  - Don't remove details a senior engineer needs; explain them so everyone else can follow too.
- Explain why, not only what. When describing a design choice, say what problem it solves or
  what it trades away, so a reader new to the field can follow the reasoning.
- Avoid insider shorthand:
  - Slang: "footgun", "yak shave", "bikeshed", "dogfood", "LGTM".
  - Internal nicknames and private abbreviations.
  - Bare references to records or tasks. When citing "ADR-0011" or "M2.6", say in the same
    sentence what it decided or what it is.
- Introduce one new idea at a time, building on what has already been explained. Give abstract
  ideas a concrete example. Use an analogy only if it is accurate, and add it next to the real
  explanation rather than in place of it.
- Don't make readers feel behind: leave out "obviously", "of course", "trivially", "as you
  know", and "it's well known that".
- Keep paragraphs short (about three to five sentences) and about one topic. Write headings
  that let a reader skim the page and find the part they need.
- Read the draft twice before finishing. First as a second-year computer science student: is
  any term undefined, or any step skipped? Then as a senior engineer: is anything vague,
  oversimplified, or wrong? Fix both.

### Content

- Lead with the point. The first sentence of a post or section says what changed or what the
  reader gets; background comes after.
- Be specific and checkable: version numbers, commit hashes, links to the release, PR, or ADR,
  and numbers with units. Say what hardware a measurement came from.
- Keep shipped and planned work apart. Say plainly what works today and what doesn't yet, and
  never describe planned features in the present tense.
- Write instructions in the imperative, one action per numbered step, with the expected result
  after the action. Name UI elements in **bold**, exactly as they appear on screen.
- Use code formatting (backticks) for file names, paths, commands, flags, environment variables,
  config keys, function and type names, and literal values. Don't use it for product names or
  for emphasis.
- Put code in fenced blocks with a language tag (`bash`, `rust`, `go`, `kotlin`, `yaml`, `html`).
  Leave out shell prompts (`$`), and keep command output in a separate block.
- Use descriptive link text: "the [v1.2.0 release notes](…)", never "click here" or a bare
  "here". Link the first mention of something, not every mention.
- Use tables to compare three or more attributes across items, with a header row and short cells.
  Use lists for sequences and sets; use prose for reasoning.
- Write alt text that says what an image shows and why it matters, without "image of" or
  "screenshot of". Give purely decorative images `alt=""`.

### Posts

- Follow the front matter format in `README.md`. `project` must be a slug from
  `_data/projects.yml`.
- `description` is one or two sentences of plain text (no Markdown) of 160 characters or fewer.
  Cards, search snippets, and AI summaries all use it, so make it stand alone.
- The layout owns the page's `<h1>`, and a leading `# Heading` in the post becomes the
  sub-headline. Start the post's own sections at `##`, and don't skip levels.
- Don't rename a published post's file or change its `date` or `categories`: all three are part
  of its URL, and links to it would break.
- Kramdown (GFM input) needs a blank line before every list, table, and fenced block. Escape `|`
  inside table cells, and wrap literal `{{ }}` or `{% %}` in `{% raw %}` … `{% endraw %}`.

### Commit messages

Follow `commits.md` in this folder. It covers handing the user a copy-ready message, how to split
work into commits, and how to write the message.

## HTML

- Every page goes through `_layouts/default.html`, which supplies the doctype, `lang`, charset,
  viewport, and metadata. Don't hand-write a second `<head>`, and don't add per-page meta tags
  outside `_includes/seo.html`.
- Use semantic elements: `header`, `nav` (with an `aria-label` when there is more than one),
  exactly one `main`, `article`, `section` (always with a heading), `aside`, `footer`, `figure`
  with `figcaption`, `time datetime="…"`, and `ul` or `ol` for lists. Use `table` only for
  tabular data, with `th scope="col|row"`. Use `div` and `span` only as styling hooks.
- Use one `<h1>` per page, with headings in order. Choose a heading level for structure, not for
  its size.
- Use `<a href>` to go somewhere and `<button type="button">` to do something. Never make a `div`
  or `span` clickable. Always give a button a `type`.
- Give every control an accessible name: visible text, an `aria-label`, or `.sr-only` text, as
  the nav toggle in `_includes/header.html` does.
- ARIA:
  - Don't use ARIA when a native element or attribute does the job. Use `hidden`, not
    `aria-hidden` plus CSS, to hide content from everyone.
  - When ARIA is used, keep it in sync from JavaScript (`aria-expanded`, `aria-controls`,
    `aria-current="page"`).
  - Give decorative SVG icons `aria-hidden="true"`.
- Images:
  - Always include `alt`, plus `width` and `height` so the layout doesn't shift as images load.
  - Add `loading="lazy"` and `decoding="async"` to images below the fold, but never to the first
    large image on the page.
  - Use SVG for icons and compressed WebP, AVIF, or PNG for pictures, sized close to how large
    they display.
- Links:
  - Build internal URLs with Liquid's `relative_url` or `absolute_url` filters, not hard-coded
    paths.
  - Open only external links in a new tab, and give them `rel="noopener"` (keep `me` on identity
    links).
- Forms: give every input a `<label for>`, the right `type` (`search`, `email`, `url`), and
  `autocomplete` where it applies. A placeholder is never a label.
- Markup style:
  - Use lowercase element and attribute names, double-quoted attribute values, and boolean
    attributes without values (`hidden`, `defer`).
  - Don't use inline `style` attributes or `on*` handlers: styles belong in
    `assets/css/style.css` and behavior in `assets/js/site.js`.
  - Match the file's existing convention for void elements; the layouts and includes write
    `<meta …>` with no trailing slash.
- Escape Liquid output for its context: `| escape` in attributes, `| jsonify` inside JSON-LD, and
  `| strip_html | normalize_whitespace` for descriptions.

## CSS

- Keep all styles in `assets/css/style.css`, and use the custom properties in `:root` (`--teal`,
  `--text-2`, `--line`, `--gutter`, and so on) instead of new hard-coded colors or sizes. Add a
  token when a value is new and will be reused.
- Name classes with BEM (`block__element--modifier`) and state classes with `is-` (`is-open`,
  `is-current`). JavaScript selects `data-*` hooks; CSS styles classes. Don't style by ID.
- Keep specificity low: one class per selector where possible, no deep descendant chains, and no
  `!important` outside `.sr-only`, the reduced-motion block, and print styles.
- Use flexbox or grid with `gap` for layout. Use `rem`, `em`, `%`, and `clamp()` for type and
  spacing, and avoid fixed heights on anything that holds text.
- Reuse the existing `max-width` breakpoints (1080, 1024, 900, and 640 px) instead of adding new
  ones. Pages must work from 320 px wide up with no horizontal scrolling.
- Meet WCAG 2.2 AA:
  - Contrast of at least 4.5:1 for body text and 3:1 for large text, icons, borders of controls,
    and focus indicators.
  - Targets of at least 24 × 24 px; 44 × 44 px is better for primary actions.
  - Never remove the `:focus-visible` outline without replacing it with something as visible.
  - Never use color alone to show state or meaning.
- Motion: animate only `transform` and `opacity`, and add new animations to the
  `prefers-reduced-motion: reduce` block. Keep the `@media print` styles working.

## JavaScript

- Use progressive enhancement. Every page must work without `site.js`: content and links are in
  the HTML, and the script adds behavior. Show UI that only works with JavaScript through the
  `.js` class on `<html>`, so it never appears broken without it.
- Write plain JavaScript with no framework, dependency, or build step. GitHub Pages serves the
  repository as it is.
- Add code inside the existing strict-mode IIFE in `assets/js/site.js`. Use `const` (or `let` if
  the value changes), never `var`, and use `===`.
- Build DOM nodes with `document.createElement` (the `el()` helper) and `textContent`. Never put
  GitHub API data, URL parameters, or user input into `innerHTML`.
- Guard every lookup (`if (!node) return;`) so a missing element on one page can't break the
  others.
- Attach events with `addEventListener`, and use event delegation for lists.
- Wrap storage access in `try`/`catch` (use the `session` helper).
- Network calls such as the GitHub API:
  - Handle failure, rate limiting (403 and 429), and offline use.
  - Keep the static content as the fallback, and cache results in `sessionStorage`.
- Keyboard: a menu or panel that opens must be reachable with Tab, close on Escape, and return
  focus to the control that opened it.
- Respect `reduceMotion` for scrolling and animation. Don't leave `console.log` calls behind.

## Performance

- Don't add third-party scripts, trackers, or font families without a stated reason. The fonts
  already use `preconnect` and `display=swap`.
- Keep the `?v={{ site.time | date: '%s' }}` cache busting on stylesheet and script links.
- Aim for Core Web Vitals in the "good" range: LCP within 2.5 s, INP within 200 ms, CLS under 0.1.

## Jekyll and GitHub Pages

- GitHub Pages builds with the `github-pages` gem: Jekyll 3.x and a fixed plugin allowlist. Don't
  use Jekyll 4-only features or plugins outside that list.
- `sitemap.xml`, `llms.txt`, and `llms-full.txt` are Liquid templates built from posts, pages, and
  `_data/`. When you add a top-level page, check that `llms.txt` lists it.

## Before finishing

1. Run `bundle exec jekyll serve` and read the rendered page, not only the source.
2. Check the page at desktop width and at 375 px, using only the keyboard, and with JavaScript
   off if you changed `site.js`.
3. Check the browser console for errors and the page for broken links.
4. Proofread changed prose for spelling, names, version numbers, and dates, and confirm every
   claim against its source (release, PR, commit, or ADR).
5. Do the two-reader check from "Audience and readability": every term is either plain or
   explained for a student, and nothing is less exact than before for a senior engineer.
