import fs from "fs";
import os from "os";
import path from "path";

import resolvePartials, { resolvePartialPath, PARTIAL_PATTERN } from "../resolvePartials";

const makeTempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), "partials-"));

const write = (dir, relativePath, contents) => {
  const filePath = path.join(dir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, "utf8");
  return filePath;
};

describe("PARTIAL_PATTERN", () => {
  it("matches handlebars-style references with optional whitespace", () => {
    const matches = [
      ..."{{> header/main}} {{>aboutme}} {{>  awards  }}".matchAll(PARTIAL_PATTERN),
    ].map((m) => m[1]);
    expect(matches).toEqual(["header/main", "aboutme", "awards"]);
  });

  it("ignores text that is not a partial reference", () => {
    expect("plain markdown with {braces} and {{notapartial}}".match(PARTIAL_PATTERN)).toBeNull();
  });
});

describe("resolvePartialPath", () => {
  it("appends .md when no extension is present", () => {
    expect(resolvePartialPath("./src/sections", "header/main")).toBe(
      path.join("./src/sections", "header/main.md"),
    );
  });

  it("keeps an explicit extension", () => {
    expect(resolvePartialPath("./src/sections", "header/main.md")).toBe(
      path.join("./src/sections", "header/main.md"),
    );
  });
});

describe("resolvePartials", () => {
  let dir;

  beforeEach(() => {
    dir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("returns markdown untouched when there are no partials", () => {
    expect(resolvePartials("# Just content", { partialDir: dir })).toBe("# Just content");
  });

  it("inlines a referenced partial", () => {
    write(dir, "header/main.md", "# Header");
    const output = resolvePartials("{{> header/main}}\n\nrest", { partialDir: dir });
    expect(output).toBe("# Header\n\nrest");
  });

  it("resolves partials recursively", () => {
    write(dir, "outer.md", "outer-top\n{{> inner}}\nouter-bottom");
    write(dir, "inner.md", "INNER");
    const output = resolvePartials("{{> outer}}", { partialDir: dir });
    expect(output).toBe("outer-top\nINNER\nouter-bottom");
  });

  it("throws a helpful error when a partial is missing", () => {
    expect(() => resolvePartials("{{> nope}}", { partialDir: dir })).toThrow(
      /Could not read partial "nope"/,
    );
  });

  it("detects circular references", () => {
    write(dir, "a.md", "{{> b}}");
    write(dir, "b.md", "{{> a}}");
    expect(() => resolvePartials("{{> a}}", { partialDir: dir })).toThrow(
      /Circular partial reference/,
    );
  });

  it("rejects references that escape the partials directory", () => {
    expect(() => resolvePartials("{{> ../../etc/passwd}}", { partialDir: dir })).toThrow(
      /escapes the partials directory/,
    );
  });
});
