import meta from "../meta";

const CONFIG = {
  name: "Joe Bloggs",
  description: "Enter a summary of you here.",
  preview: {
    image: "https://cv.joebloggs.com/preview.png",
    text: "Joe Bloggs CV",
  },
  url: "https://cv.joebloggs.com/",
  twitterUser: "@joebloggs",
};

describe("meta", () => {
  it("returns the fallback block when config is missing", () => {
    expect(meta(null)).toContain("<title>CV</title>");
    expect(meta(undefined)).toContain("<title>CV</title>");
  });

  it("returns the fallback block when name is missing", () => {
    expect(meta({ description: "x" })).toContain("<title>CV</title>");
  });

  it("includes name, description and URL when provided", () => {
    const out = meta(CONFIG);
    expect(out).toContain("<title>Joe Bloggs CV</title>");
    expect(out).toContain(`content="Enter a summary of you here."`);
    expect(out).toContain(`href="https://cv.joebloggs.com/"`);
  });

  it("emits a valid JSON-LD <script> block", () => {
    const out = meta(CONFIG);
    expect(out).toContain('<script type="application/ld+json">');
    const match = out.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(match).not.toBeNull();
  });

  it("escapes HTML-special characters in name", () => {
    const out = meta({ ...CONFIG, name: 'Evil"><script>x</script>' });
    expect(out).not.toContain("<script>x</script>");
    expect(out).toContain("&quot;");
  });

  it("escapes </script> sequences inside the JSON-LD block", () => {
    const out = meta({ ...CONFIG, description: "</script><script>alert(1)</script>" });
    // Extract the JSON-LD script body
    const body = out.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
    expect(body).not.toContain("</script>");
    expect(body).toContain("\\u003c/script>");
  });

  it("escapes U+2028/U+2029 line separators inside the JSON-LD block", () => {
    const ls = String.fromCharCode(0x2028);
    const ps = String.fromCharCode(0x2029);
    const out = meta({ ...CONFIG, description: `line${ls}sep${ps}end` });
    const body = out.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
    expect(body).not.toContain(ls);
    expect(body).not.toContain(ps);
    expect(body).toContain("\\u2028");
    expect(body).toContain("\\u2029");
  });

  it("does not crash when preview is missing", () => {
    expect(() => meta({ ...CONFIG, preview: undefined })).not.toThrow();
  });
});
