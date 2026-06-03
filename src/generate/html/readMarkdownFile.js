import { Marked } from "marked";
import fs from "fs";

const markdown = new Marked();

// Finds the index of the `>` that closes the opening tag, ignoring any `>` that
// appears inside a quoted attribute value (e.g. `<div data-x="a>b">`).
const findOpenTagEnd = (html) => {
  let quote = null;
  for (let i = 0; i < html.length; i += 1) {
    const ch = html[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      }
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ">") {
      return i;
    }
  }
  return -1;
};

// True when the block opens and closes with balanced `<div>`/`</div>` tags, which
// means its single outermost wrapper is a div whose closer is the final `</div>`.
const isSingleDivWrapper = (html) => {
  if (!html.startsWith("<div") || !html.endsWith("</div>")) {
    return false;
  }
  const opens = (html.match(/<div\b/g) || []).length;
  const closes = (html.match(/<\/div>/g) || []).length;
  return opens > 0 && opens === closes;
};

markdown.use({
  renderer: {
    html(html) {
      const trimmed = html.trim();
      if (!isSingleDivWrapper(trimmed)) {
        return html;
      }

      const openTagEnd = findOpenTagEnd(trimmed);
      if (openTagEnd === -1) {
        return html;
      }

      const openTag = trimmed.slice(0, openTagEnd + 1);
      const inner = trimmed.slice(openTagEnd + 1, trimmed.length - "</div>".length);
      // `markdown.parse` recurses through this same renderer, so nested divs are
      // handled too.
      return `${openTag} ${markdown.parse(inner)} </div>`;
    },
  },
});

const readRawMarkdown = (target, markdownOptions) => {
  return fs.readFileSync(target, markdownOptions.encoding);
};

const renderMarkdown = (source) => markdown.parse(source);

const readMarkdownFile = (target, markdownOptions) => {
  return renderMarkdown(readRawMarkdown(target, markdownOptions));
};

export { readRawMarkdown, renderMarkdown };
export default readMarkdownFile;
