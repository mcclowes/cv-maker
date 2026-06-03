import fs from "fs";
import { PDFDocument } from "pdf-lib";

import generatePdfFromHtml from "../index.js";

const mockPdf = jest.fn();
const mockSetContent = jest.fn().mockResolvedValue(undefined);
const mockEmulateMedia = jest.fn().mockResolvedValue(undefined);
const mockNewPage = jest.fn().mockResolvedValue({
  setContent: mockSetContent,
  emulateMedia: mockEmulateMedia,
  pdf: mockPdf,
});
const mockClose = jest.fn().mockResolvedValue(undefined);
const mockLaunch = jest.fn().mockResolvedValue({
  newPage: mockNewPage,
  close: mockClose,
});

jest.mock("playwright-core", () => ({
  chromium: {
    launch: () => mockLaunch(),
  },
}));

jest.mock("playwright", () => ({
  chromium: {
    launch: () => mockLaunch(),
  },
}));

const HTML = "<html><body>Test CV</body></html>";

// A genuinely valid (if empty) PDF so pdf-lib can load and re-save it.
let validPdfBytes;

beforeAll(async () => {
  const doc = await PDFDocument.create();
  doc.addPage();
  validPdfBytes = Buffer.from(await doc.save());
});

// Returns the bytes handed to the most recent fs.writeFileSync call.
const lastWrittenBytes = () => {
  const calls = fs.writeFileSync.mock.calls;
  return calls[calls.length - 1][1];
};

describe("generatePdfFromHtml", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPdf.mockResolvedValue(validPdfBytes);
    jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    fs.writeFileSync.mockRestore();
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it("generates PDF with default options and writes it to disk", async () => {
    await generatePdfFromHtml(HTML, "./test.pdf", {});

    expect(mockLaunch).toHaveBeenCalled();
    expect(mockNewPage).toHaveBeenCalled();
    expect(mockSetContent).toHaveBeenCalledWith(HTML, {
      waitUntil: "networkidle",
    });
    expect(mockEmulateMedia).toHaveBeenCalledWith({ media: "screen" });
    expect(mockPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: "A4",
        printBackground: true,
      }),
    );
    // Playwright is asked for a buffer (no `path`); we write it ourselves.
    expect(mockPdf).toHaveBeenCalledWith(expect.not.objectContaining({ path: expect.anything() }));
    expect(fs.writeFileSync).toHaveBeenCalledWith("./test.pdf", expect.anything());
    expect(mockClose).toHaveBeenCalled();
  });

  it("uses default destination when none provided", async () => {
    await generatePdfFromHtml(HTML, undefined, {});

    expect(fs.writeFileSync).toHaveBeenCalledWith("./output.pdf", expect.anything());
  });

  it("merges custom PDF options", async () => {
    await generatePdfFromHtml(HTML, "./custom.pdf", {
      pdfOptions: {
        format: "Letter",
        landscape: true,
      },
    });

    expect(mockPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: "Letter",
        landscape: true,
      }),
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith("./custom.pdf", expect.anything());
  });

  it("embeds PDF document metadata from meta.name and meta.description", async () => {
    await generatePdfFromHtml(HTML, "./meta.pdf", {
      meta: { name: "Jane Doe", description: "A summary" },
    });

    const written = await PDFDocument.load(lastWrittenBytes());
    expect(written.getTitle()).toBe("Jane Doe CV");
    expect(written.getAuthor()).toBe("Jane Doe");
    expect(written.getSubject()).toBe("A summary");
  });

  it("writes the unmodified bytes when no meta is supplied", async () => {
    await generatePdfFromHtml(HTML, "./no-meta.pdf", {});

    expect(lastWrittenBytes()).toBe(validPdfBytes);
  });

  it("closes browser even on error", async () => {
    mockPdf.mockRejectedValueOnce(new Error("PDF generation failed"));

    await expect(generatePdfFromHtml(HTML, "./test.pdf", {})).rejects.toThrow(
      "PDF generation failed",
    );

    expect(mockClose).toHaveBeenCalled();
  });
});

describe("generatePdfFromHtml error handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPdf.mockResolvedValue(validPdfBytes);
    jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    fs.writeFileSync.mockRestore();
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it("logs helpful message when browser executable is missing", async () => {
    const executableError = new Error(
      "browserType.launch: Executable doesn't exist at /path/to/chromium",
    );
    mockLaunch.mockRejectedValueOnce(executableError);

    await expect(generatePdfFromHtml(HTML, "./test.pdf", {})).rejects.toThrow(
      "Executable doesn't exist",
    );

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Playwright browser is not installed"),
    );
  });

  it("rethrows non-executable errors without special message", async () => {
    const networkError = new Error("Network timeout");
    mockLaunch.mockRejectedValueOnce(networkError);

    await expect(generatePdfFromHtml(HTML, "./test.pdf", {})).rejects.toThrow("Network timeout");
  });
});
