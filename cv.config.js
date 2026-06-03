const defaults = {
  debug: true,
  website: false,
  primary: false,
  // Writing the rendered CV to README.md is off by default so the project's
  // documentation README is never overwritten by a build. Flip to `true` (e.g.
  // in a variant's `overrides`) if you want your CV to render into the repo's
  // README — handy for a github.com/<you>/<you> profile repo.
  readme: false,
  printOptions: {
    displayHeaderFooter: false,
  },
  // Base filename for generated PDFs. The primary variant writes
  // `<outputName>.pdf`; others write `<outputName>_<variant>.pdf`.
  outputName: "joebloggs_cv",
  // Web-only download button. Point this at wherever you publish the PDF.
  downloadLink: "joebloggs_cv.pdf",
};

const meta = {
  name: "Joe Bloggs",
  description:
    "Full-stack software engineer with 6+ years building web apps in React, TypeScript, and Node. I care about clean interfaces, fast feedback loops, and mentoring the people around me.",
  preview: {
    image: "assets/preview.png",
    text: "Joe Bloggs CV",
  },
  url: "https://joebloggs.com/",
  twitterUser: "@joebloggs",
  // Structured data (JSON-LD) fields for SEO / AI search engines.
  email: "joe@example.com",
  jobTitle: "Software Engineer",
  employer: "Example Corp",
};

// Each variant points at a single main markdown file that composes the CV from
// shared sections via partial references (e.g. `{{> header/main}}`). Partials
// resolve relative to `src/sections`. A `content` array of file paths is still
// supported for backwards compatibility.
const cvs = {
  // The evergreen, general-purpose CV. Marked primary, so it owns the canonical
  // output names (joebloggs_cv.pdf, index.html, debug.html).
  main: {
    content: "./src/cvs/main.md",
    overrides: {
      website: true,
      primary: true,
      style: ["cv", "newspaper"],
    },
  },
  // A role-specific variant. Everything for the application lives together in
  // src/applications/example/ (cv.md + reference-only jd.md and cover-letter.md).
  example: {
    content: "./src/applications/example/cv.md",
    overrides: {
      style: ["cv", "newspaper"],
    },
  },
};

export const config = {
  defaults,
  meta,
  cvs,
};
