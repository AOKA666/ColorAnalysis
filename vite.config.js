import { defineConfig } from "vite";
import { resolve } from "node:path";
import { readdirSync } from "node:fs";

const blogPages = Object.fromEntries(
  readdirSync(resolve(import.meta.dirname, "blog"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => [
      `blog-${entry.name}`,
      resolve(import.meta.dirname, "blog", entry.name, "index.html")
    ])
);

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        privacy: resolve(import.meta.dirname, "privacy.html"),
        terms: resolve(import.meta.dirname, "terms.html"),
        blog: resolve(import.meta.dirname, "blog", "index.html"),
        ...blogPages
      }
    }
  }
});
