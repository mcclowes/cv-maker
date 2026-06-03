import readMarkdownFile, { readRawMarkdown, renderMarkdown } from "../readMarkdownFile";

const FIXTURE = "src/generate/html/__tests__/markdown.md";
const DEFAULTS = { encoding: "utf8" };

describe("readRawMarkdown", () => {
  it("returns the raw markdown source untouched", () => {
    const raw = readRawMarkdown(FIXTURE, DEFAULTS);
    expect(typeof raw).toBe("string");
    expect(raw).toContain("#");
  });
});

describe("renderMarkdown", () => {
  it("converts markdown to HTML", () => {
    expect(renderMarkdown("# Hello")).toContain("<h1>Hello</h1>");
  });

  it("re-parses markdown inside a single-div wrapper", () => {
    const output = renderMarkdown('<div class="x">\n\n# inner\n\n</div>');
    expect(output).toContain("<h1>inner</h1>");
    expect(output).toContain('<div class="x">');
  });

  it("leaves non-div HTML blocks alone", () => {
    const output = renderMarkdown("<section>raw</section>");
    expect(output).toContain("<section>raw</section>");
  });

  it("re-parses markdown inside nested div wrappers", () => {
    const output = renderMarkdown(
      '<div class="outer">\n\n<div class="inner">\n\n# deep\n\n</div>\n\n</div>',
    );
    expect(output).toContain("<h1>deep</h1>");
    expect(output).toContain('<div class="outer">');
    expect(output).toContain('<div class="inner">');
  });

  it("does not mistake a '>' inside an attribute for the end of the open tag", () => {
    const output = renderMarkdown('<div data-expr="a>b">\n\n# inner\n\n</div>');
    expect(output).toContain("<h1>inner</h1>");
    expect(output).toContain('data-expr="a>b"');
  });
});

describe("readMarkdownFile (default)", () => {
  it("reads and renders in one step", () => {
    const html = readMarkdownFile(FIXTURE, DEFAULTS);
    expect(html).toContain("<h1>");
  });
});
