module.exports = {
  transform: {
    "^.+\\.js?$": "babel-jest",
  },
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/__tests__/**",
    "!src/**/*.spec.js",
    "!src/**/*.test.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.js", "**/*.spec.js", "**/*.test.js"],
  verbose: true,
};
