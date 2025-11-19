import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [viteTsConfigPaths()],
  test: {
    coverage: {
      thresholds: {
        autoUpdate: true,
        branches: 99.12,
        functions: 100,
        lines: 100,
        statements: 100
      },
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "**/*.spec.ts",
        "**/*.d.ts",
        "**/*.bench.ts",
        "**/*.test-d.ts",
        "**/*.test.ts",
        "**/*.config.*",
        "**/dist/**",
        "**/src/index.ts"
      ]
    }
  }
});
