import fs from "fs";
import { PDFDocument } from "pdf-lib";

const DEFAULT_PDF_OPTIONS = {
  format: "A4",
  margin: {
    top: "0cm",
    right: "0cm",
    bottom: "0cm",
    left: "0cm",
  },
  printBackground: true,
  displayHeaderFooter: false,
};

const buildPdfMetadata = (meta) => {
  if (!meta) {
    return {};
  }

  const metadata = {};

  if (meta.name) {
    metadata.title = `${meta.name} CV`;
    metadata.author = meta.name;
  }

  if (meta.description) {
    metadata.subject = meta.description;
  }

  return metadata;
};

// Playwright's `page.pdf()` cannot write document metadata (it has no
// title/author/subject options), so we post-process the bytes with pdf-lib.
const applyPdfMetadata = async (bytes, meta) => {
  const metadata = buildPdfMetadata(meta);
  if (Object.keys(metadata).length === 0) {
    return bytes;
  }

  const doc = await PDFDocument.load(bytes);
  if (metadata.title) {
    doc.setTitle(metadata.title);
  }
  if (metadata.author) {
    doc.setAuthor(metadata.author);
  }
  if (metadata.subject) {
    doc.setSubject(metadata.subject);
  }

  return doc.save();
};

const getPlaywright = async () => {
  if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
    process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
  }

  try {
    const playwrightCore = await import("playwright-core");
    if (playwrightCore?.chromium) {
      return playwrightCore.chromium;
    }
  } catch (error) {
    const code = error?.code;
    if (code !== "ERR_MODULE_NOT_FOUND" && code !== "MODULE_NOT_FOUND") {
      throw error;
    }
  }

  try {
    const playwright = await import("playwright");
    if (playwright?.chromium) {
      return playwright.chromium;
    }
  } catch (error) {
    const code = error?.code;
    if (code !== "ERR_MODULE_NOT_FOUND" && code !== "MODULE_NOT_FOUND") {
      throw error;
    }
  }

  throw new Error(
    [
      "A Playwright package is required to generate PDFs.",
      "Install one of:",
      "  - npm install --save-dev playwright      # includes browsers",
      "  - npm install --save-dev playwright-core # bring your own browser",
    ].join("\n"),
  );
};

const generatePdfFromHtml = async (html, destination = "./output.pdf", options = {}) => {
  console.log("Starting PDF generation...");

  const chromium = await getPlaywright();
  let browser;
  try {
    browser = await chromium.launch();
  } catch (error) {
    const message = String(error?.message || "");
    if (message.includes("Executable doesn't exist")) {
      console.error(
        [
          "Playwright browser is not installed.",
          "Run to install Chromium locally:",
          "  npm_config_cache=$(pwd)/.npm-cache PLAYWRIGHT_BROWSERS_PATH=0 npx --yes playwright install chromium",
        ].join("\n"),
      );
    }
    throw error;
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "screen" });

    // Render to a buffer (no `path`) so we can stamp metadata before writing.
    const pdfOptions = {
      ...DEFAULT_PDF_OPTIONS,
      ...(options.pdfOptions || {}),
    };

    console.log("Creating PDF with options:", pdfOptions);
    const renderedBytes = await page.pdf(pdfOptions);
    const finalBytes = await applyPdfMetadata(renderedBytes, options.meta);
    fs.writeFileSync(destination, finalBytes);
    console.log(`${destination} generated`);
  } catch (error) {
    console.error("Failed to generate PDF", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export default generatePdfFromHtml;
