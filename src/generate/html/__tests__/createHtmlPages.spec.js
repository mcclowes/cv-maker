import createHtmlPages from "../createHtmlPages";
import markdown from "./markdown.md";

describe("createHtmlPages", () => {
  it("generates correct html", () => {
    expect(createHtmlPages(markdown)).toMatchSnapshot();
  });
});
