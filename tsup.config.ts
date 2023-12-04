import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "./dist",
  splitting: false,
  treeshake: true,
  sourcemap: true,
  clean: true,
  dts: { resolve: true },
  format: ["esm", "cjs"]
});
