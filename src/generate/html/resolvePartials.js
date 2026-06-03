import fs from "fs";
import path from "path";

// Partial references look like `{{> header/main}}` and resolve, by default,
// relative to `src/sections`. The `.md` extension is optional.
const PARTIAL_PATTERN = /\{\{>\s*([^}\s]+?)\s*\}\}/g;
const DEFAULT_PARTIAL_DIR = "./src/sections";
const DEFAULT_ENCODING = "utf8";

const resolvePartialPath = (partialDir, reference) => {
  const withExtension = path.extname(reference) ? reference : `${reference}.md`;
  return path.join(partialDir, withExtension);
};

// Guards against `{{> ../../etc/passwd }}` style traversal: the resolved file
// must stay inside the partials directory.
const assertWithinPartialDir = (partialDir, filePath, reference) => {
  const baseDir = path.resolve(partialDir);
  const resolved = path.resolve(filePath);
  if (resolved !== baseDir && !resolved.startsWith(baseDir + path.sep)) {
    throw new Error(
      `Partial reference "${reference}" escapes the partials directory (resolved to ${resolved}).`,
    );
  }
};

const resolvePartials = (
  rawMarkdown,
  { partialDir = DEFAULT_PARTIAL_DIR, encoding = DEFAULT_ENCODING, seen = new Set() } = {},
) => {
  return rawMarkdown.replace(PARTIAL_PATTERN, (_match, reference) => {
    const filePath = resolvePartialPath(partialDir, reference);
    assertWithinPartialDir(partialDir, filePath, reference);

    if (seen.has(filePath)) {
      throw new Error(
        `Circular partial reference detected: "${reference}" (${filePath}) is already being included.`,
      );
    }

    let contents;
    try {
      contents = fs.readFileSync(filePath, encoding);
    } catch (err) {
      throw new Error(
        `Could not read partial "${reference}" (resolved to ${filePath}): ${err.message}`,
      );
    }

    return resolvePartials(contents, {
      partialDir,
      encoding,
      seen: new Set([...seen, filePath]),
    });
  });
};

export { resolvePartials, resolvePartialPath, PARTIAL_PATTERN, DEFAULT_PARTIAL_DIR };
export default resolvePartials;
