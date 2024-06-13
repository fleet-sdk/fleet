import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [viteTsConfigPaths({ root: "." })],
  test: {
    coverage: {
      thresholds: { "100": true },
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["**/*.spec.ts"]
    }
  }
});
