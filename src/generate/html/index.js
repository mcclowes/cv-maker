import fs from "fs";

import readStylesheets from "./readStylesheets.js";
import { readRawMarkdown, renderMarkdown } from "./readMarkdownFile.js";
import { resolvePartials } from "./resolvePartials.js";
import { parseFrontmatter } from "./frontmatter.js";
import { splitPages, wrapPagesInDivs, PAGE_BREAK_PATTERNS } from "./createHtmlPages.js";
import meta from "./meta.js";
import { escapeHtmlAttr } from "./escape.js";

const MARKDOWN_OPTIONS_DEFAULT = {
  encoding: "utf8",
};

// Frontmatter keys that map onto SEO meta. Everything else parsed from
// frontmatter is treated as non-rendered context (purpose, lastEdited, ...).
const META_KEYS = ["name", "description", "url", "jobTitle", "employer", "email", "twitterUser"];

// Reads each top-level source, strips and collects any leading frontmatter, and
// returns the frontmatter-free bodies alongside the merged frontmatter data.
const collectSources = (content, markdownOptions) => {
  const sources = Array.isArray(content) ? content : [content];

  let frontmatter = {};
  const bodies = sources.map((source) => {
    const { data, body } = parseFrontmatter(readRawMarkdown(source, markdownOptions));
    frontmatter = { ...frontmatter, ...data };
    return body;
  });

  return { bodies, frontmatter };
};

// Expands every body's partials and joins them into one markdown document.
const expandSources = (bodies, markdownOptions) =>
  bodies.map((body) => resolvePartials(body, { encoding: markdownOptions.encoding })).join("\n\n");

const renderPages = (expandedMarkdown) => {
  const markdownPages = splitPages(expandedMarkdown);
  const htmlPages = markdownPages.map(renderMarkdown);
  return wrapPagesInDivs(htmlPages);
};

// Page-break tokens are layout directives with no meaning in a README; drop them.
const stripPageBreaks = (markdown) =>
  PAGE_BREAK_PATTERNS.reduce((acc, pattern) => acc.replace(pattern, "\n"), markdown);

// Frontmatter is the base layer; the config (`options`) overrides it.
const metaFromFrontmatter = (frontmatter) =>
  META_KEYS.reduce((acc, key) => {
    if (frontmatter[key] !== undefined) {
      acc[key] = frontmatter[key];
    }
    return acc;
  }, {});

const writeHtmlFile = (html, fileName) => {
  console.log(`Saving ${fileName}...`);

  try {
    fs.writeFileSync(fileName, html, "utf8");
  } catch (err) {
    console.error(`Error writing file: ${fileName}`, err.message);
    throw err;
  }
};

const buildHtml = (css, html, options, mode = "web") => {
  const inlineFonts =
    mode === "web"
      ? `
            /* colors and fonts */
            @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700');
            @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@300;400;500;600;700;800;900&display=swap');
            `
      : "";

  // CSS inlining is on by default; callers (e.g. tests) can opt out explicitly.
  const inlineCss = options.inlineStyles === false ? "" : css;
  const downloadHref = options.downloadLink ? escapeHtmlAttr(options.downloadLink) : null;

  return `
		<!DOCTYPE html>
		<html lang="en-GB" class="${mode}">
			<head>
				<meta charset="utf-8">
        ${meta(options.meta)}

				<style>
          ${inlineFonts}
					${inlineCss}
				</style>
			</head>

			<body class="document">
				<div class="pages">
					${html}

          ${
            downloadHref
              ? `<a class="download-link" href="${downloadHref}" target="_blank" aria-label="Download CV as PDF" rel="noopener">
                <svg x="0px" y="0px" width="36.375px" height="36.376px" viewBox="0 0 36.375 36.376" style="enable-background:new 0 0 36.375 36.376;" xml:space="preserve" aria-hidden="true" focusable="false">
                  <g>
                    <path d="M33.938,25.626v8.25c0,1.383-1.119,2.5-2.5,2.5h-26.5c-1.381,0-2.5-1.117-2.5-2.5v-8.25c0-1.381,1.119-2.5,2.5-2.5
                      s2.5,1.119,2.5,2.5v5.75h21.5v-5.75c0-1.381,1.119-2.5,2.5-2.5S33.938,24.245,33.938,25.626z M16.42,27.768
                      c0.488,0.488,1.129,0.732,1.768,0.732c0.643,0,1.279-0.244,1.77-0.732l7.5-7.498c0.978-0.975,0.978-2.558,0-3.535
                      c-0.977-0.977-2.561-0.977-3.535,0l-3.231,3.232V2.5c0-1.381-1.119-2.5-2.5-2.5s-2.5,1.119-2.5,2.5v17.467l-3.232-3.232
                      c-0.977-0.977-2.561-0.977-3.535,0c-0.977,0.978-0.977,2.56,0,3.535L16.42,27.768z"/>
                  </g>
                </svg>
                Download CV
              </a>`
              : ""
          }
				</div>
			</body>
		</html>
	`;
};

const createReadme = (content) => {
  return `
[![Spellcheck Markdown Files](https://github.com/mcclowes/cv-maker/actions/workflows/spellcheck.yml/badge.svg)](https://github.com/mcclowes/cv-maker/actions/workflows/spellcheck.yml)
[![CI](https://github.com/mcclowes/cv-maker/actions/workflows/ci.yml/badge.svg)](https://github.com/mcclowes/cv-maker/actions/workflows/ci.yml)

${content}
`;
};

const renderHtmlBundle = (content, options = {}) => {
  console.log("Generating HTML...");

  const markdownOptions = options.markdownOptions || MARKDOWN_OPTIONS_DEFAULT;
  const { bodies, frontmatter } = collectSources(content, markdownOptions);

  // Config wins over frontmatter; frontmatter only supplies values config omits.
  const mergedMeta = { ...metaFromFrontmatter(frontmatter), ...(options.meta || {}) };
  const styleOptions = options.customStyles || options.style || frontmatter.style || "cv";

  const effectiveOptions = { ...options, meta: mergedMeta };

  const expandedMarkdown = expandSources(bodies, markdownOptions);
  const html = renderPages(expandedMarkdown);
  const css = readStylesheets(styleOptions).join("");

  return {
    frontmatter,
    pdf: buildHtml(css, html, effectiveOptions, "pdf"),
    website: options.website ? buildHtml(css, html, effectiveOptions, "web") : null,
    debug: options.debug ? buildHtml(css, html, effectiveOptions, "debug pdf") : null,
    readme: createReadme(stripPageBreaks(expandedMarkdown)),
  };
};

export { writeHtmlFile };
export default renderHtmlBundle;
