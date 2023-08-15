import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "./dist",
  splitting: false,
  treeshake: true,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ["esm", "cjs"],
  outExtension({ format }) {
    return { js: `.${format}.js` };
  }
});
