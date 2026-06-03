import fs from "fs";
import path from "path";
import os from "os";

import renderHtmlBundle from "../index";

describe("page-break regression — splitting happens before markdown rendering", () => {
  let tmpFile;

  beforeEach(() => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cv-pagebreak-"));
    tmpFile = path.join(dir, "content.md");
  });

  afterEach(() => {
    try {
      fs.unlinkSync(tmpFile);
    } catch {
      // ignore
    }
  });

  it("does not produce a <p> element straddling a page boundary", () => {
    fs.writeFileSync(tmpFile, "Line one of paragraph.\n\\page\nLine two of paragraph.\n", "utf8");

    const { pdf } = renderHtmlBundle(tmpFile);

    expect(pdf).not.toMatch(/<p>[^<]*<\/div>/);
    expect(pdf).not.toMatch(/<div class="page"[^>]*>[^<]*<\/p>/);
    expect(pdf).toContain('id="p1"');
    expect(pdf).toContain('id="p2"');
  });

  it("renders each page as independent, well-formed markdown", () => {
    fs.writeFileSync(
      tmpFile,
      "# Page 1 heading\n\nParagraph A.\n\n\\page\n\n# Page 2 heading\n\nParagraph B.\n",
      "utf8",
    );

    const { pdf } = renderHtmlBundle(tmpFile);
    const page1Match = pdf.match(/id="p1">([\s\S]*?)<\/div>\s*<div class="page" id="p2"/);
    const page2Match = pdf.match(/id="p2">([\s\S]*?)<\/div>/);

    expect(page1Match).not.toBeNull();
    expect(page2Match).not.toBeNull();
    expect(page1Match[1]).toContain("<h1>Page 1 heading</h1>");
    expect(page1Match[1]).toContain("<p>Paragraph A.</p>");
    expect(page2Match[1]).toContain("<h1>Page 2 heading</h1>");
    expect(page2Match[1]).toContain("<p>Paragraph B.</p>");
  });
});
