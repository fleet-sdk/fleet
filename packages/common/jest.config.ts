export default {
  collectCoverageFrom: ["./src/**/*.ts", "!./src/**/I[A-Z]*.ts", "!./src/**/index.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "./src/tests", "./src/types"],
  coverageDirectory: "./coverage",
  coverageProvider: "v8",
  coverageReporters: ["text", "json"],
  collectCoverage: false,
  testEnvironment: "node",
  coverageThreshold: {
    global: {
      statements: "100",
      lines: "100",
      branches: "100",
      functions: "100"
    }
  },
  // maxWorkers: 1, // this limit is being used to circumvent this issue https://github.com/facebook/jest/issues/11617
  preset: "ts-jest",
  roots: ["./src"]
};
