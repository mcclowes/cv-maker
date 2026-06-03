import { config } from "../cv.config.js";
import generatePdfFromHtml from "./generate/pdf/index.js";
import renderHtmlBundle, { writeHtmlFile } from "./generate/html/index.js";

const validateConfig = (cvConfig, variation) => {
  if (!cvConfig) {
    throw new Error("Configuration is missing. Ensure cv.config.js exports a valid config object.");
  }

  const { defaults, meta, cvs } = cvConfig;

  if (!cvs || typeof cvs !== "object" || Object.keys(cvs).length === 0) {
    throw new Error(
      "No CV variations defined in cv.config.js. Add at least one CV to the 'cvs' object.",
    );
  }

  // `primary` is resolved as defaults <- overrides at build time, so the guard
  // must check that same merged value — not `overrides.primary` in isolation.
  const isPrimary = (entry) => ({ ...defaults, ...entry?.overrides }).primary === true;
  const primaryVariations = Object.entries(cvs).filter(([, entry]) => isPrimary(entry));
  if (primaryVariations.length > 1) {
    const names = primaryVariations.map(([key]) => key).join(", ");
    throw new Error(
      `Multiple CV variations marked primary (${names}). At most one variation may set primary: true.`,
    );
  }

  const variationKey = variation || Object.keys(cvs)[0];

  if (!cvs[variationKey]) {
    const availableVariations = Object.keys(cvs).join(", ");
    throw new Error(
      `CV variation "${variationKey}" not found. Available variations: ${availableVariations}`,
    );
  }

  const { content } = cvs[variationKey];

  const hasContent =
    typeof content === "string"
      ? content.trim().length > 0
      : Array.isArray(content) && content.length > 0;

  if (!hasContent) {
    throw new Error(
      `CV variation "${variationKey}" has no content defined. Set 'content' to a main markdown file path (or an array of file paths).`,
    );
  }

  return { defaults, meta, cvs, variationKey };
};

// The primary variation owns the canonical output names (index.html, debug.html,
// README.md); every other variation is suffixed with its key so a multi-variation
// build can never silently clobber another variation's output.
const persistBundle = (bundle, { variationKey, primary = false, readme = false } = {}) => {
  const suffix = primary ? "" : `_${variationKey}`;

  if (bundle.website) {
    writeHtmlFile(bundle.website, `index${suffix}.html`);
  }
  if (bundle.debug) {
    writeHtmlFile(bundle.debug, `debug${suffix}.html`);
  }
  // Writing the rendered CV to README.md is opt-in (`readme: true` in config) so a
  // default build never clobbers the project's documentation README.
  if (primary && readme && bundle.readme) {
    writeHtmlFile(bundle.readme, "README.md");
  }
};

const createCV = async (variation) => {
  const { defaults, meta, cvs, variationKey } = validateConfig(config, variation);
  const { content, overrides } = cvs[variationKey];

  const options = {
    meta,
    ...defaults,
    ...overrides,
  };

  const baseName = options.outputName || "cv";
  const destination = options.primary ? `./${baseName}.pdf` : `./${baseName}_${variationKey}.pdf`;

  const bundle = renderHtmlBundle(content, options);

  persistBundle(bundle, {
    variationKey,
    primary: Boolean(options.primary),
    readme: Boolean(options.readme),
  });

  await generatePdfFromHtml(bundle.pdf, destination, {
    meta: options.meta,
    pdfOptions: options.pdfOptions,
  });

  return destination;
};

const main = async () => {
  const inputs = process.argv.slice(2);

  try {
    if (inputs.length > 0) {
      for (const cv of inputs) {
        await createCV(cv);
      }
    } else {
      await createCV();
    }
    console.log("CV generation completed successfully.");
  } catch (error) {
    console.error("CV generation failed:", error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  main();
}

export { createCV, validateConfig, persistBundle, main };
