import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";

const name = "index";

export default defineConfig(() => {
  return {
    plugins: [dts()],
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"),
        name: "astro-meta-tags",
        fileName: (format) => (format === "es" ? `${name}.mjs` : `${name}.js`),
      },
    },
  };
});
