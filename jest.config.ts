export default {
  collectCoverageFrom: ["./src/**/*.ts"],
  coverageDirectory: "./coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "./src/types"],
  coverageProvider: "v8",
  coverageReporters: ["text", "lcov"],
  coverageThreshold: {
    global: {
      lines: 100
    }
  },
  preset: "ts-jest",
  roots: ["./src"]
};
