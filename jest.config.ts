export default {
  collectCoverageFrom: ["./src/**/*.ts", "!./src/**/I[A-Z]*.ts", "!./src/**/index.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "./src/types", "./src/mocks"],
  coverageDirectory: "./coverage",
  coverageProvider: "v8",
  coverageReporters: ["text", "lcov"],
  preset: "ts-jest",
  roots: ["./src"]
};
