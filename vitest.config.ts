import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [viteTsConfigPaths()],
  test: {
    coverage: {
      thresholds: {
        "100": true
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
        "**/common/src/types/index.ts", // probably a vitest bug
        "**/common/src/types/enums.ts", // no need to test enums directly
        "**/common/src/constants.ts", // no need to test constants directly
        "**/src/index.ts"
      ]
    }
  }
});
