import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"],
      lines: 100,
      statements: 100,
      branches: 98.34,
      functions: 100,
      thresholdAutoUpdate: true,
      exclude: ["**/tests/**", "**/*.spec.ts"]
    }
  }
});
