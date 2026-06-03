import { parseFrontmatter } from "../frontmatter";

describe("parseFrontmatter", () => {
  describe("when there is no frontmatter", () => {
    it("returns empty data and the body unchanged", () => {
      const raw = "# Hello\n\nSome content.";
      const { data, body } = parseFrontmatter(raw);
      expect(data).toEqual({});
      expect(body).toBe(raw);
    });

    it("does not treat a leading horizontal rule as frontmatter", () => {
      const raw = "---\n\nFirst real line."; // no closing fence -> not frontmatter
      const { data, body } = parseFrontmatter(raw);
      expect(data).toEqual({});
      expect(body).toBe(raw);
    });

    it("does not treat a non-leading fenced block as frontmatter", () => {
      const raw = "# Title\n\n---\nkey: value\n---\n";
      const { data, body } = parseFrontmatter(raw);
      expect(data).toEqual({});
      expect(body).toBe(raw);
    });
  });

  describe("when there is frontmatter", () => {
    it("parses scalar string values and strips the block from the body", () => {
      const raw =
        "---\npurpose: Tailored for the platform role\naudience: Example Corp\n---\n# Heading";
      const { data, body } = parseFrontmatter(raw);
      expect(data).toEqual({ purpose: "Tailored for the platform role", audience: "Example Corp" });
      expect(body).toBe("# Heading");
    });

    it("keeps date-like values as strings", () => {
      const { data } = parseFrontmatter("---\nlastEdited: 2026-06-01\n---\nbody");
      expect(data.lastEdited).toBe("2026-06-01");
    });

    it("parses booleans and numbers", () => {
      const { data } = parseFrontmatter("---\nprimary: true\npages: 2\nratio: 1.5\n---\nbody");
      expect(data).toEqual({ primary: true, pages: 2, ratio: 1.5 });
    });

    it("parses inline arrays", () => {
      const { data } = parseFrontmatter("---\nstyle: [cv, newspaper]\n---\nbody");
      expect(data.style).toEqual(["cv", "newspaper"]);
    });

    it("strips surrounding quotes from values", () => {
      const { data } = parseFrontmatter('---\ntitle: "Hello: World"\n---\nbody');
      expect(data.title).toBe("Hello: World");
    });

    it("preserves colons in unquoted values (e.g. URLs)", () => {
      const { data } = parseFrontmatter("---\nurl: https://cv.example.com/\n---\nbody");
      expect(data.url).toBe("https://cv.example.com/");
    });

    it("ignores blank lines and comments inside the block", () => {
      const raw = "---\n# a comment\n\npurpose: ship it\n---\nbody";
      const { data } = parseFrontmatter(raw);
      expect(data).toEqual({ purpose: "ship it" });
    });

    it("handles an empty frontmatter block", () => {
      const { data, body } = parseFrontmatter("---\n---\nbody");
      expect(data).toEqual({});
      expect(body).toBe("body");
    });

    it("tolerates CRLF line endings", () => {
      const { data, body } = parseFrontmatter("---\r\npurpose: ship\r\n---\r\nbody");
      expect(data).toEqual({ purpose: "ship" });
      expect(body).toBe("body");
    });
  });
});
