export default {
  collectCoverageFrom: ["./src/**/*.ts"],
  coverageDirectory: "./coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "./src/types"],
  coverageProvider: "v8",
  coverageReporters: ["text", "lcov"],
  preset: "ts-jest",
  roots: ["./src"]
};
