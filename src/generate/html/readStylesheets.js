import fs from "fs";

const STYLESHEETS = {
  cv: "./src/styles/cv.css",
  newspaper: "./src/styles/newspaper.css",
};

const readStyle = (style) => {
  try {
    return fs.readFileSync(style, "utf8");
  } catch (err) {
    console.error(`Error reading stylesheet: ${style}`, err.message);
    throw err;
  }
};

const readStylesheets = (styleOptions) => {
  console.log("Stylesheets:", styleOptions);

  const options = Array.isArray(styleOptions) ? styleOptions : [styleOptions];
  return options.map((option) => readStyle(STYLESHEETS[option] || option));
};

export default readStylesheets;
