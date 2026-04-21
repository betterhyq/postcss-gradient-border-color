import { defineConfig } from "tsdown";

export default defineConfig({
  attw: {
    ignoreRules: ["false-export-default"],
  },
  banner: "// Powered by YONGQI",
  deps: {
    neverBundle: ["postcss"],
  },
  devtools: true,
  dts: {
    oxc: true,
  },
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  minify: true,
  platform: "neutral",
  publint: true,
  shims: true,
  sourcemap: true
});
