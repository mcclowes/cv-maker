const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
};

const escapeHtmlAttr = (value) => escapeHtml(value);

// Escapes JSON for safe embedding in a <script> element: `<` defuses `</script>`
// breakout, and U+2028/U+2029 are valid in JSON but terminate statements inside a
// script, which would otherwise corrupt the page.
const escapeJsonForScript = (json) =>
  json
    .replace(/</g, "\\u003c")
    .replace(/-->/g, "--\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

export { escapeHtml, escapeHtmlAttr, escapeJsonForScript };
