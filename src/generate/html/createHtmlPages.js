const PAGE_BREAK_PATTERNS = [/\\page/g, /<!--\s*PAGE_BREAK\s*-->/g, /---PAGE---/g];

const NORMALIZED_DELIMITER = "<<<PAGE_BREAK>>>";

const normalizePageBreaks = (input) => {
  let normalized = input;
  for (const pattern of PAGE_BREAK_PATTERNS) {
    normalized = normalized.replace(pattern, NORMALIZED_DELIMITER);
  }
  return normalized;
};

const splitPages = (input) => normalizePageBreaks(input).split(NORMALIZED_DELIMITER);

const wrapPagesInDivs = (pages) =>
  pages.map((page, index) => `<div class="page" id="p${index + 1}">${page}</div>`).join(" ");

const createHtmlPages = (input) => wrapPagesInDivs(splitPages(input));

export default createHtmlPages;
export { normalizePageBreaks, splitPages, wrapPagesInDivs, PAGE_BREAK_PATTERNS };
