import generateHtml from "../html";

const CONFIG = {
  name: "Joe Bloggs",
  description: "Enter a summary of you here.",
  previewImage: "https://cv.joebloggs.com/preview.png",
  previewImageText: "Joe Bloggs CV",
  url: "https://cv.joebloggs.com/",
  twitterUsername: "@joebloggs",
}

const OPTIONS_DEFAULT = {
  debug: false,
  website: false,
  primary: false,
  printOptions: {
    displayHeaderFooter: false,
  },
  meta: CONFIG,
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
