import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "./dist",
  sourcemap: true,
  clean: true,
  dts: { resolve: true },
  format: ["esm", "cjs", "iife"]
});
