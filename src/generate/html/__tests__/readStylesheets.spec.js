import readStylesheets from "../readStylesheets";
import fs from "fs";

jest.mock("fs");

describe("readStylesheets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.readFileSync.mockReturnValue("/* mock css */");
  });

  it("reads a single stylesheet by name", () => {
    const result = readStylesheets("cv");
    expect(fs.readFileSync).toHaveBeenCalledWith("./src/styles/cv.css", "utf8");
    expect(result).toEqual(["/* mock css */"]);
  });

  it("reads multiple stylesheets", () => {
    const result = readStylesheets(["cv", "newspaper"]);
    expect(fs.readFileSync).toHaveBeenCalledTimes(2);
    expect(result).toEqual(["/* mock css */", "/* mock css */"]);
  });

  it("reads custom stylesheet path when not in preset list", () => {
    readStylesheets("./custom/path.css");
    expect(fs.readFileSync).toHaveBeenCalledWith("./custom/path.css", "utf8");
  });

  it("always returns an array", () => {
    const singleResult = readStylesheets("cv");
    const arrayResult = readStylesheets(["cv"]);
    expect(Array.isArray(singleResult)).toBe(true);
    expect(Array.isArray(arrayResult)).toBe(true);
  });

  it("throws error when file cannot be read", () => {
    fs.readFileSync.mockImplementation(() => {
      throw new Error("File not found");
    });
    expect(() => readStylesheets("nonexistent")).toThrow("File not found");
  });
});
