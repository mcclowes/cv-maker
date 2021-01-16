import meta from "../meta";

const CONFIG = {
  name: "Joe Bloggs",
  description: "Enter a summary of you here.",
  previewImage: "https://cv.joebloggs.com/preview.png",
  previewImageText: "Joe Bloggs CV",
  url: "https://cv.joebloggs.com/",
  twitterUsername: "@joebloggs",
}

describe("meta", () => {
  it("generates correct meta html", () => {
    expect(
      meta(CONFIG)
    ).toMatchSnapshot();
  });
});
