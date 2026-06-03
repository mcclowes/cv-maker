# PDF generation

PDFs are rendered with Playwright's Chromium engine. Install the runtime dependency in your project before building:

```
npm install --save-dev playwright-core
```

The generator automatically merges any `pdfOptions` you pass through `createCV` with the defaults below:

- `format`: Defaults to `"A4"`. Any format supported by [`page.pdf`](https://playwright.dev/docs/api/class-page#page-pdf) is accepted.
- `margin`: All sides default to `"0cm"`. Provide a partial object (e.g. `{ top: "1cm" }`) to override individual edges.
- `printBackground`: Defaults to `true` so background colors are preserved.

Any additional options supported by Playwright's [`page.pdf`](https://playwright.dev/docs/api/class-page#page-pdf) API are forwarded untouched.
