import fs from "fs";

const STYLESHEETS = {
  cv: "./src/styles/cv.css",
  newspaper: "./src/styles/newspaper.css",
};

const readStyle = style => 
  fs.readFileSync(style, function (err) {
    if (err) console.log(err);
  })

const readStylesheets = (styleOptions) => {
  console.log("Stylesheets:", styleOptions);

  if(Array.isArray(styleOptions)) {
    return styleOptions.map(option => 
      readStyle(STYLESHEETS[option] || option)
    )
  }

  return readStyle(STYLESHEETS[styleOptions] || styleOptions)
};

export default readStylesheets;
