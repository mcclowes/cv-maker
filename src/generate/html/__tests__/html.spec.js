import generateHtml from "../html";

const OPTIONS_DEFAULT = {
  debug: false,
  website: false,
  primary: false,
  printOptions: {
    displayHeaderFooter: false,
  },
};

describe("generateHtml", () => {
  it("default", () => {
    expect(
      generateHtml(
        "src/generate/html/__tests__/markdown.md"
      )
    ).toMatchSnapshot();
  });

  it("with standard options", () => {
    expect(
      generateHtml(
        "src/generate/html/__tests__/markdown.md", 
        OPTIONS_DEFAULT
      )
    ).toMatchSnapshot();
  });

  it("for website", () => {
    expect(
      generateHtml(
        "src/generate/html/__tests__/markdown.md", 
        {
          ...OPTIONS_DEFAULT,
          website: true,
        }
      )
    ).toMatchSnapshot();
  });

  it("with array", () => {
    expect(
      generateHtml(
        [
          "src/generate/html/__tests__/markdown.md",
          "src/generate/html/__tests__/markdown.md",
        ], 
        OPTIONS_DEFAULT
      )
    ).toMatchSnapshot();
  });
});
