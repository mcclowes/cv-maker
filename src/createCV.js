import generatePDF from "./generate/pdf";

const defaultOptions = {
  debug: false,
  website: false,
  primary: false,
  printOptions: {
    displayHeaderFooter: false,
  },
};

const meta = {
  name: "Joe Bloggs",
  description: "Enter a summary of you here.",
  previewImage: "https://cv.joebloggs.com/preview.png",
  previewImageText: "Joe Bloggs CV",
  url: "https://cv.joebloggs.com/",
  twitterUsername: "@joebloggs",
}

const variations = {
  engineering_frontend: {
    files: [
      "./src/sections/header/engineering_fe.md",
      "./src/sections/introduction/engineering_fe.md",
      "./src/sections/experience/engineering_fe.md",
      "./src/sections/education/engineering_fe.md",
      "./src/sections/aboutme.md",
    ],
    customOptions: {
      website: true,
      primary: true,
      debug: true,
    },
  },
  engineering_fullstack: {
    files: [
      "./src/sections/header/engineering_fs.md",
      "./src/sections/introduction/engineering_fs.md",
      "./src/sections/experience/engineering_fs.md",
      "./src/sections/education/engineering_fs.md",
      "./src/sections/aboutme.md",
    ],
    customOptions: {
      debug: true,
      style: [
        "cv",
        "newspaper",
      ],
    },
  },
};

const DEFAULT_CV = "engineering_frontend"

const MY_NAME = "joebloggs"

const createCV = (variation) => {
  const { files, customOptions } = variations[variation];

  const options = {
    meta,
    ...defaultOptions,
    ...customOptions,
  }

  const destination = options.primary
    ? `./${MY_NAME}.pdf`
    : `./${MY_NAME}_${variation}.pdf`;

  generatePDF(files, destination, options);
};

const cvs = process.argv.slice(2);

if (cvs.length > 0) {
  cvs.forEach((cv) => createCV(cv));
} else {
  createCV(DEFAULT_CV);
}
