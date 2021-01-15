import readMarkdownFile from "../readMarkdownFile";

const MARKDOWN_OPTIONS_DEFAULT = {
  encoding: "utf8",
};

describe("readMarkdownFile", () => {
  it("generates correct html", () => {
    expect(
      readMarkdownFile(
        "src/generate/html/__tests__/markdown.md", 
        MARKDOWN_OPTIONS_DEFAULT
      )
    ).toMatchSnapshot();
  });
});
