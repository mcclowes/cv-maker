// Optional frontmatter for CV main files (`src/cvs/*.md`). A leading block
// fenced by `---` lines carries metadata and context (purpose, last edited,
// audience, meta/style fallbacks). The block is stripped before rendering so it
// never appears in the output. This is a deliberately small YAML subset:
// flat `key: value` pairs, inline `[a, b]` arrays, booleans and numbers.

const FENCE = "---";

const parseScalar = (raw) => {
  const value = raw.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  return value;
};

const parseValue = (raw) => {
  const value = raw.trim();

  if (value === "") {
    return null;
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map(parseScalar);
  }

  return parseScalar(value);
};

const parseBlock = (block) => {
  const data = {};

  for (const line of block.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf(":");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    if (key === "") {
      continue;
    }

    data[key] = parseValue(trimmed.slice(separator + 1));
  }

  return data;
};

// Returns `{ data, body }`. When no leading frontmatter is present, `data` is an
// empty object and `body` is the input unchanged.
const parseFrontmatter = (raw) => {
  const normalised = raw.replace(/\r\n/g, "\n");

  if (!normalised.startsWith(`${FENCE}\n`)) {
    return { data: {}, body: raw };
  }

  const closingIndex = normalised.indexOf(`\n${FENCE}`, FENCE.length);
  if (closingIndex === -1) {
    return { data: {}, body: raw };
  }

  const block = normalised.slice(FENCE.length + 1, closingIndex);
  const afterFence = normalised.indexOf("\n", closingIndex + 1);
  const body = afterFence === -1 ? "" : normalised.slice(afterFence + 1);

  return { data: parseBlock(block), body };
};

export { parseFrontmatter };
export default parseFrontmatter;
