import _ from "lodash";

import readStylesheet from "./readStylesheet";
import readMarkdownFile from "./readMarkdownFile";
import createHtmlPages from "./createHtmlPages";

import fs from "fs";

const STYLESHEETS = {
  cv: "./src/styles/cv.css",
};

const MARKDOWN_OPTIONS_DEFAULT = {
  encoding: "utf8",
};

const handleTargetPages = (targets, markdownOptions) => {
  if (Array.isArray(targets)) {
    return createHtmlPages(
      targets.map((path) => readMarkdownFile(path, markdownOptions)).join(" ")
    );
  }

  return createHtmlPages(readMarkdownFile(targets, markdownOptions));
};

const createHtmlFile = (html, fileName = "index.html") => {
  console.log(`Saving ${fileName}...`);

  fs.writeFile(fileName, html, function (err) {
    if (err) console.log(err);
  });
};

const MY_NAME = "Joe Bloggs"

const buildHtml = (css, html, mode = "web") =>
  `
		<html>
			<head>
				<title>${MY_NAME}</title>

				<meta name="description" content="The CV of ${MY_NAME}">

				<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=2,shrink-to-fit=no">

				<link rel="icon" href="/favicon.ico" />

				<style>
					${css}
				</style>
			</head>
			
			<body class="document">
				<div class="pages ${mode}">
					${html}
				</div>
			</body>
		</html>
	`;

const generateHtml = (targets, options = {}) => {
  console.log("Generating HTML...");

  const styleOptions = options.customStyles
    ? options.customStyles
    : STYLESHEETS[options.style] || STYLESHEETS.cv;

  const markdownOptions = options.markdownOptions || MARKDOWN_OPTIONS_DEFAULT;

  const html = handleTargetPages(targets, markdownOptions);

  const css = readStylesheet(styleOptions);

  createHtmlFile(html, "cv.md");

  if (options.debug)
    createHtmlFile(buildHtml(css, html, "debug"), "debug.html");

  if (options.website) createHtmlFile(buildHtml(css, html));

  return buildHtml(css, html, "pdf");
};

export default generateHtml;
