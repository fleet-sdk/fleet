export default {
  coveragePathIgnorePatterns: ["/node_modules/", "./src/tests"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/coverage/"],
  collectCoverage: false,
  testEnvironment: "node",
  maxWorkers: 1, // this limit is being used to circumvent this issue https://github.com/facebook/jest/issues/11617
  preset: "ts-jest",
  roots: ["./packages"]
};
