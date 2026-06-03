# Getting started

A step-by-step walkthrough of installing, building, and customising your CV.
For the formatting reference (CSS classes, page breaks, icons, entry formats)
see [`src/sections/_template.md`](src/sections/_template.md).

## Prerequisites

- [Node.js](https://nodejs.org/) — pinned to Node 20 via `.nvmrc` (`nvm use`)
- npm (bundled with Node.js)
- Playwright Chromium browser — required for PDF generation

Check your versions:

```bash
node --version
npm --version
```

## Installation

```bash
npm install
npx playwright install chromium   # one-time browser download
npm run build                     # verify everything compiles
```

## Building

### Default build

```bash
npm run build
```

With no arguments this builds the **primary variant** — the one with
`primary: true` in `cv.config.js` (`main` by default). It writes the primary PDF
(`joebloggs_cv.pdf`), `index.html`, and `debug.html`.

### Build specific variants

Pass one or more variant keys from `cv.config.js`:

```bash
npm run build -- example
npm run build -- main example
```

Non-primary variants are written as `joebloggs_cv_<variant>.pdf` and do not
overwrite the primary's `index.html`.

### Watch mode

```bash
npm run watch
```

Rebuilds whenever anything under `src/` changes.

## Customising your CV

1. **Identity & SEO** — edit `meta` in `cv.config.js` (name, description, email,
   URL, job title, employer, social preview).
2. **Content** — edit the Markdown under `src/sections/`. Each file is one
   section (header, introduction, experience, skills, education, awards, about
   me). HTML is allowed where Markdown isn't enough.
3. **Composition** — `src/cvs/main.md` lists the sections to include via
   `{{> ... }}` partials. Reorder, add, or remove them.
4. **Output name** — change `outputName` in `cv.config.js` to rename the PDF.
5. **Styles** — pick `style` per variant (`cv`, `newspaper`), or edit the CSS in
   `src/styles/`.

## Tailoring for a specific role

Create a folder under `src/applications/`, e.g. `src/applications/acme/`, with:

- `cv.md` — the tailored CV (write the variant-specific intro inline; pull shared
  sections in with partials)
- `jd.md` — paste the job description here for reference (never built; excluded
  from spellcheck)
- `cover-letter.md` — your cover letter draft (spellchecked, since it's your prose)

Register it in the `cvs` object in `cv.config.js`, then `npm run build -- acme`.
Copy `src/applications/example/` as a starting point.

## Quality checks

```bash
npm run lint          # ESLint over src/
npm run spellcheck    # cspell over CV markdown
npm test              # Jest unit tests
npm run validate      # lint + test together
```

If spellcheck flags a real word (a name, product, or acronym), add it to the
`words` array in `cspell.config.json`.

## Troubleshooting

- **PDF generation fails** — ensure the browser is installed:
  `npx playwright install chromium`.
- **Dependency issues** — delete `node_modules` and run `npm install` again.
- **A partial isn't found** — paths resolve relative to `src/sections/`, so
  `{{> header/main }}` maps to `src/sections/header/main.md`.
