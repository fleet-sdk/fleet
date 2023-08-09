import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "_test-vectors": "./packages/_test-vectors/",
      packages: "./packages"
    }
  },
  test: {
    environment: "node",
    threads: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      lines: 100,
      statements: 100,
      branches: 100,
      functions: 100,
      thresholdAutoUpdate: true,
      exclude: ["**/tests/**", "**/_tests/**", "**/_test-vectors/**", "**/*.spec.ts"]
    }
  }
});
