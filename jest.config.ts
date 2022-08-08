export default {
  collectCoverageFrom: ["./src/**/*.ts", "!./src/**/I[A-Z]*.ts", "!./src/**/index.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "./src/types", "./src/mocks"],
  coverageDirectory: "./coverage",
  coverageProvider: "v8",
  coverageReporters: ["text", "lcov"],
  coverageThreshold: {
    global: {
      statements: "100",
      lines: "100",
      branches: "100",
      functions: "100"
    }
  },
  preset: "ts-jest",
  roots: ["./src"]
};
