import createHtmlPages, {
  normalizePageBreaks,
  splitPages,
  wrapPagesInDivs,
  PAGE_BREAK_PATTERNS,
} from "../createHtmlPages";

describe("createHtmlPages", () => {
  it("wraps content in page div", () => {
    expect(createHtmlPages("Hello world")).toBe('<div class="page" id="p1">Hello world</div>');
  });

  it("splits on \\page delimiter", () => {
    expect(createHtmlPages("Page 1\\pagePage 2")).toBe(
      '<div class="page" id="p1">Page 1</div> <div class="page" id="p2">Page 2</div>',
    );
  });

  it("splits on HTML comment delimiter", () => {
    expect(createHtmlPages("Page 1<!-- PAGE_BREAK -->Page 2")).toBe(
      '<div class="page" id="p1">Page 1</div> <div class="page" id="p2">Page 2</div>',
    );
  });

  it("splits on ---PAGE--- delimiter", () => {
    expect(createHtmlPages("Page 1---PAGE---Page 2")).toBe(
      '<div class="page" id="p1">Page 1</div> <div class="page" id="p2">Page 2</div>',
    );
  });

  it("handles mixed page break formats", () => {
    const result = createHtmlPages("A\\pageB<!-- PAGE_BREAK -->C---PAGE---D");
    expect(result).toContain('id="p1"');
    expect(result).toContain('id="p4"');
  });

  it("handles empty content", () => {
    expect(createHtmlPages("")).toBe('<div class="page" id="p1"></div>');
  });
});

describe("splitPages", () => {
  it("returns a single-element array when there are no breaks", () => {
    expect(splitPages("hello")).toEqual(["hello"]);
  });

  it("returns one element per page", () => {
    expect(splitPages("a\\pageb\\pagec")).toEqual(["a", "b", "c"]);
  });
});

describe("wrapPagesInDivs", () => {
  it("numbers pages from 1", () => {
    expect(wrapPagesInDivs(["a", "b"])).toBe(
      '<div class="page" id="p1">a</div> <div class="page" id="p2">b</div>',
    );
  });
});

describe("normalizePageBreaks", () => {
  it("normalizes all three formats to a single delimiter", () => {
    expect(normalizePageBreaks("A\\pageB<!-- PAGE_BREAK -->C---PAGE---D")).toBe(
      "A<<<PAGE_BREAK>>>B<<<PAGE_BREAK>>>C<<<PAGE_BREAK>>>D",
    );
  });
});

describe("PAGE_BREAK_PATTERNS", () => {
  it("exports an array of regexes", () => {
    expect(Array.isArray(PAGE_BREAK_PATTERNS)).toBe(true);
    PAGE_BREAK_PATTERNS.forEach((pattern) => {
      expect(pattern).toBeInstanceOf(RegExp);
    });
  });
});
