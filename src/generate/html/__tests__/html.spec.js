import renderHtmlBundle from "../index";

const CONFIG = {
  name: "Joe Bloggs",
  description: "Enter a summary of you here.",
  preview: {
    image: "https://cv.joebloggs.com/preview.png",
    text: "Joe Bloggs CV",
  },
  url: "https://cv.joebloggs.com/",
  twitterUsername: "@joebloggs",
};

const OPTIONS_DEFAULT = {
  debug: false,
  website: false,
  primary: false,
  inlineStyles: false,
  printOptions: {
    displayHeaderFooter: false,
  },
  meta: CONFIG,
};

const FIXTURE = "src/generate/html/__tests__/markdown.md";
const FRONTMATTER_FIXTURE = "src/generate/html/__tests__/with-frontmatter.md";

describe("renderHtmlBundle", () => {
  it("always returns a pdf string", () => {
    const bundle = renderHtmlBundle(FIXTURE);
    expect(typeof bundle.pdf).toBe("string");
    expect(bundle.pdf).toContain('class="pdf"');
  });

  it("always returns a readme string", () => {
    const bundle = renderHtmlBundle(FIXTURE);
    expect(typeof bundle.readme).toBe("string");
    expect(bundle.readme).toContain("badge.svg");
  });

  it("builds the readme from markdown source, not rendered HTML", () => {
    const bundle = renderHtmlBundle(FIXTURE, OPTIONS_DEFAULT);
    expect(bundle.readme).not.toContain('<div class="page"');
  });

  it("omits website and debug when their options are false", () => {
    const bundle = renderHtmlBundle(FIXTURE, OPTIONS_DEFAULT);
    expect(bundle.website).toBeNull();
    expect(bundle.debug).toBeNull();
  });

  it("includes website output when website: true", () => {
    const bundle = renderHtmlBundle(FIXTURE, { ...OPTIONS_DEFAULT, website: true });
    expect(bundle.website).toContain('class="web"');
  });

  it("includes debug output when debug: true", () => {
    const bundle = renderHtmlBundle(FIXTURE, { ...OPTIONS_DEFAULT, debug: true });
    expect(bundle.debug).toContain('class="debug pdf"');
  });

  it("wraps every page in a numbered page div", () => {
    const bundle = renderHtmlBundle(FIXTURE, OPTIONS_DEFAULT);
    expect(bundle.pdf).toContain('id="p1"');
  });

  it("accepts an array of files and produces one combined document", () => {
    const bundle = renderHtmlBundle([FIXTURE, FIXTURE], OPTIONS_DEFAULT);
    expect(bundle.pdf).toContain('id="p1"');
  });

  it("inlines CSS by default", () => {
    const bundle = renderHtmlBundle(FIXTURE, { ...OPTIONS_DEFAULT, inlineStyles: true });
    expect(bundle.pdf).toContain("--color-green");
  });

  it("omits CSS when inlineStyles is false", () => {
    const bundle = renderHtmlBundle(FIXTURE, { ...OPTIONS_DEFAULT, inlineStyles: false });
    expect(bundle.pdf).not.toContain("--color-green");
  });

  describe("frontmatter", () => {
    it("exposes parsed frontmatter on the bundle", () => {
      const bundle = renderHtmlBundle(FRONTMATTER_FIXTURE, OPTIONS_DEFAULT);
      expect(bundle.frontmatter).toMatchObject({
        purpose: "Demonstrate frontmatter parsing in tests",
        lastEdited: "2026-06-01",
        style: ["cv"],
      });
    });

    it("strips the frontmatter block from the rendered output", () => {
      const bundle = renderHtmlBundle(FRONTMATTER_FIXTURE, OPTIONS_DEFAULT);
      expect(bundle.pdf).toContain("Frontmatter fixture");
      expect(bundle.pdf).not.toContain("Demonstrate frontmatter parsing");
      expect(bundle.pdf).not.toContain("lastEdited");
    });

    it("lets config meta override frontmatter meta", () => {
      const bundle = renderHtmlBundle(FRONTMATTER_FIXTURE, {
        ...OPTIONS_DEFAULT,
        meta: { name: "Joe Bloggs", description: "Config description" },
      });
      expect(bundle.pdf).toContain("Config description");
      expect(bundle.pdf).not.toContain("Frontmatter description");
    });

    it("falls back to frontmatter meta when config omits a field", () => {
      const bundle = renderHtmlBundle(FRONTMATTER_FIXTURE, {
        ...OPTIONS_DEFAULT,
        meta: { name: "Joe Bloggs" },
      });
      expect(bundle.pdf).toContain("Frontmatter description");
    });

    it("returns empty frontmatter for files without a block", () => {
      const bundle = renderHtmlBundle(FIXTURE, OPTIONS_DEFAULT);
      expect(bundle.frontmatter).toEqual({});
    });
  });

  it("escapes the download link href", () => {
    const bundle = renderHtmlBundle(FIXTURE, {
      ...OPTIONS_DEFAULT,
      website: true,
      downloadLink: 'https://example.com/"><script>alert(1)</script>',
    });
    expect(bundle.website).not.toContain("<script>alert(1)</script>");
    expect(bundle.website).toContain("&quot;");
  });
});
