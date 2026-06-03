import { validateConfig } from "../createCV";

describe("validateConfig", () => {
  const validConfig = {
    defaults: { debug: true },
    meta: { name: "Test" },
    cvs: {
      product: {
        content: ["./src/sections/test.md"],
        overrides: {},
      },
      design: {
        content: ["./src/sections/design.md"],
        overrides: {},
      },
    },
  };

  describe("with valid configuration", () => {
    it("returns config with default variation when none specified", () => {
      const result = validateConfig(validConfig, undefined);

      expect(result.variationKey).toBe("product");
      expect(result.defaults).toEqual(validConfig.defaults);
      expect(result.meta).toEqual(validConfig.meta);
      expect(result.cvs).toEqual(validConfig.cvs);
    });

    it("returns config with specified variation", () => {
      const result = validateConfig(validConfig, "design");

      expect(result.variationKey).toBe("design");
    });

    it("returns first variation key when no variation specified", () => {
      const result = validateConfig(validConfig);

      expect(result.variationKey).toBe("product");
    });
  });

  describe("with invalid configuration", () => {
    it("throws error when config is null", () => {
      expect(() => validateConfig(null)).toThrow(
        "Configuration is missing. Ensure cv.config.js exports a valid config object.",
      );
    });

    it("throws error when config is undefined", () => {
      expect(() => validateConfig(undefined)).toThrow("Configuration is missing");
    });

    it("throws error when cvs is missing", () => {
      const config = { defaults: {}, meta: {} };

      expect(() => validateConfig(config)).toThrow("No CV variations defined in cv.config.js");
    });

    it("throws error when cvs is empty object", () => {
      const config = { defaults: {}, meta: {}, cvs: {} };

      expect(() => validateConfig(config)).toThrow("No CV variations defined in cv.config.js");
    });

    it("throws error when requested variation does not exist", () => {
      expect(() => validateConfig(validConfig, "nonexistent")).toThrow(
        'CV variation "nonexistent" not found. Available variations: product, design',
      );
    });

    it("throws error when variation has no content", () => {
      const config = {
        defaults: {},
        meta: {},
        cvs: {
          empty: {
            content: [],
            overrides: {},
          },
        },
      };

      expect(() => validateConfig(config, "empty")).toThrow(
        'CV variation "empty" has no content defined',
      );
    });

    it("accepts a single main markdown file path (string content)", () => {
      const config = {
        defaults: {},
        meta: {},
        cvs: {
          single: {
            content: "./src/cvs/main.md",
            overrides: {},
          },
        },
      };

      expect(() => validateConfig(config, "single")).not.toThrow();
    });

    it("throws error when variation content is an empty string", () => {
      const config = {
        defaults: {},
        meta: {},
        cvs: {
          invalid: {
            content: "   ",
            overrides: {},
          },
        },
      };

      expect(() => validateConfig(config, "invalid")).toThrow(
        'CV variation "invalid" has no content defined',
      );
    });

    it("throws error when variation content is undefined", () => {
      const config = {
        defaults: {},
        meta: {},
        cvs: {
          noContent: {
            overrides: {},
          },
        },
      };

      expect(() => validateConfig(config, "noContent")).toThrow(
        'CV variation "noContent" has no content defined',
      );
    });

    it("throws error when more than one variation is marked primary", () => {
      const config = {
        defaults: {},
        meta: {},
        cvs: {
          first: {
            content: ["./a.md"],
            overrides: { primary: true },
          },
          second: {
            content: ["./b.md"],
            overrides: { primary: true },
          },
        },
      };

      expect(() => validateConfig(config)).toThrow(/Multiple CV variations marked primary/);
    });

    it("accepts a single primary variation", () => {
      const config = {
        defaults: {},
        meta: {},
        cvs: {
          first: { content: ["./a.md"], overrides: { primary: true } },
          second: { content: ["./b.md"], overrides: {} },
        },
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it("detects multiple primary variations introduced via defaults.primary", () => {
      const config = {
        defaults: { primary: true },
        meta: {},
        cvs: {
          first: { content: ["./a.md"], overrides: {} },
          second: { content: ["./b.md"], overrides: {} },
        },
      };

      expect(() => validateConfig(config)).toThrow(/Multiple CV variations marked primary/);
    });

    it("lets an override opt a variation out of a primary default", () => {
      const config = {
        defaults: { primary: true },
        meta: {},
        cvs: {
          first: { content: ["./a.md"], overrides: {} },
          second: { content: ["./b.md"], overrides: { primary: false } },
        },
      };

      expect(() => validateConfig(config)).not.toThrow();
    });
  });
});
