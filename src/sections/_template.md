# CV Section Template

This template documents the available formatting options, classes, and structure
for writing CV content sections.

---

## Frontmatter (main CV files only)

A main CV file (`src/cvs/*.md`) may begin with an optional frontmatter block,
fenced by `---` lines, to record metadata and context. It is **stripped before
rendering** — nothing in the block appears in the HTML, PDF, or README.

```markdown
---
purpose: Tailored for senior backend / platform roles.
audience: Example Corp
lastEdited: 2026-06-02
description: Per-variant SEO description.
jobTitle: Senior Software Engineer
style: [cv, newspaper]
---

{{> header/main}}
...
```

Rules:

- **Main files only.** Section files (`src/sections/*.md`) do not support
  frontmatter; a leading `---` there is still a horizontal rule.
- **Must be the very first thing** in the file (no blank line before it) and
  closed by a matching `---` line.
- **Supported values:** strings, numbers, booleans, and inline arrays
  (`[a, b]`). Quote values to keep literal text (`title: "Hello: World"`).
  Dates stay strings (`2026-06-01`).
- **`cv.config.js` wins.** Frontmatter is a base layer the config overrides — it
  only supplies values the config omits. Meta-mapped keys (`name`,
  `description`, `url`, `jobTitle`, `employer`, `email`, `twitterUser`) feed SEO
  meta as a fallback; `style` feeds the stylesheet choice as a fallback.
- **Everything else is context** (`purpose`, `audience`, `lastEdited`, ...):
  parsed and exposed on the build (`bundle.frontmatter`) but not rendered.

---

## Composing a CV with Partials

Each CV variant is a single main markdown file in `src/cvs/` (e.g.
`src/cvs/main.md`), referenced from `cv.config.js`. A main file can pull in
shared, reusable sections using a Handlebars-style partial reference:

```markdown
{{> header/main}}

{{> education}}

{{> awards}}
```

Rules:

- Paths resolve relative to `src/sections/`, so `{{> header/main}}` includes
  `src/sections/header/main.md`.
- The `.md` extension is optional (`{{> education}}` → `src/sections/education.md`).
- Partials are expanded recursively (a partial may reference other partials);
  circular references throw an error.
- **Use partials only for genuinely shared sections** (header, education, awards,
  aboutme). Variant-specific content (a tailored intro or experience) should be
  written directly in the main file rather than kept as a single-use partial.

> Backwards compatible: a variant's `content` in `cv.config.js` can still be an
> array of file paths instead of a single main-file path.

---

## Page Breaks

Insert a page break using any of these formats:

```
\page
```

```
<!-- PAGE_BREAK -->
```

```
---PAGE---
```

---

## Section Headers

### Basic Section Header with Icon

Section headers use `<h2>` with an optional icon. Keep the icon's SVG markup
out of the content file by storing it as a partial in `src/sections/icons/` and
referencing it:

```html
<h2>
  {{> icons/experience.svg}}
  Section Title
</h2>
```

`{{> icons/experience.svg}}` inlines `src/sections/icons/experience.svg`
verbatim into the output (so it still ships in the single-file HTML and PDF),
while keeping the verbose `<path>` data in one reusable file. Sizing and fill
are handled by `h2 > svg` in `src/styles/cv.css`, so the stored SVG only needs
`viewBox` + `<path>` — drop `width`/`height`/`id`/`style` noise.

---

## Experience/Education Entries

### Standard Entry Format

```markdown
### Job Title _- Company Name_

_Start Date - End Date_

Description paragraph with [links](https://example.com).

- Bullet point with **bold** and _italic_ text
- Another achievement or responsibility
```

### Compact Entry (for older/less relevant items)

```markdown
- Role _- [Company](https://example.com), Date Range_
```

---

## Available CSS Classes

### Layout Classes

| Class | Usage | Description |
|-------|-------|-------------|
| `full-width` | `<h1 class="full-width">` | Makes element span full width |
| `page` | Auto-generated | Wraps each page (don't use manually) |
| `download-link` | Links | Styled download button (web only) |

---

## Text Formatting

| Markdown | Renders As | Use For |
|----------|-----------|---------|
| `**text**` | **bold** | Strong emphasis |
| `_text_` | _italic_ | Dates, organization names, subtle emphasis |
| `[text](url)` | link | External references |
| `> quote` | blockquote | Testimonials, quotes |

---

## Header Hierarchy

| Level | Usage | Styling |
|-------|-------|---------|
| `<h1>` or `#` | Name/title at top | Large, prominent |
| `<h2>` or `##` | Section headers | Colored background, icon support |
| `### text` | Entry titles | Accent colored, role/degree name |
| `#### text` | Sub-entries | Secondary information |

---

## Example: Complete Section

```markdown
<h2>
  {{> icons/experience.svg}}
  Experience
</h2>

### Senior Developer _- Tech Company_

_January 2022 - Present_

[Company](https://example.com) builds innovative products. Key achievements:

- Led development of core platform features
- Mentored junior developers
- Improved build times by 50%

### Junior Developer _- Startup Inc_

_June 2020 - December 2021_

Early-stage startup focused on fintech solutions.

- Built REST APIs using Node.js
- Implemented CI/CD pipeline

\page

### Other Experience

- Intern _- [Previous Company](https://example.com), 2019_
- Freelance Developer _- Self-employed, 2018_
```

---

## Example: Header Section

```html
<h1 class="full-width">Your Name</h1>

<p class="full-width">
  <a href="mailto:email@example.com">email@example.com</a> ·
  <a href="https://yourwebsite.com">yourwebsite.com</a> ·
  <a href="https://linkedin.com/in/yourprofile">LinkedIn</a>
</p>
```

---

## Tips

1. **Dates**: Use `_Date Range_` format for consistent italic styling
2. **Company names**: Include in the h3 as `_- Company Name_`
3. **Links**: Use full, canonical URLs (avoid shorteners — they're opaque and rot)
4. **Bullets**: Start with action verbs, include metrics where possible
5. **Page breaks**: Place before sections that should start on a new page
6. **HTML in Markdown**: You can embed HTML when markdown isn't sufficient
7. **Icons**: Find SVG icons at sites like iconmonstr.com or heroicons.com, then
   save them under `src/sections/icons/` and reference via `{{> icons/<name>.svg}}`

---

## File Naming Conventions

- `src/cvs/<variant>.md` - Main file for an evergreen CV variant (composes the
  whole CV)
- `src/applications/<variant>/cv.md` - Main file for a role-specific application
  variant; siblings `jd.md` and `cover-letter.md` are reference only (see below)
- `main.md` - Primary version of a shared section in `src/sections/`
- `main-markdown.md` - Alternative markdown-only version
- Prefix with `_` (like this file) for templates/non-content files

---

## Application bundles (tailored variants)

A variant written for a specific role lives in `src/applications/<variant>/`,
which keeps everything for that application together: `cv.md` (the tailored CV),
`jd.md` (source job description), and `cover-letter.md` (cover letter draft).
It's a pure directory convention.

- **CV is the only built file.** `cv.config.js` lists each `content` path
  explicitly, so `jd.md` and `cover-letter.md` are never picked up as CVs.
- **JD is reference only and not spellchecked.** `jd.md` is never built or
  rendered, and `**/applications/**/jd.md` is in cspell's `ignorePaths`, so
  pasting raw external JD text won't fail the pre-commit hook.
- **Cover letter is reference only but spellchecked** (it's your own writing).
- General-purpose variants (e.g. `main`) have no application folder.
