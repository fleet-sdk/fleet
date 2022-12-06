export default {
  coveragePathIgnorePatterns: ["/node_modules/", "./src/tests"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/coverage/"],
  collectCoverage: false,
  testEnvironment: "node",
  preset: "ts-jest",
  roots: ["./packages"]
};
