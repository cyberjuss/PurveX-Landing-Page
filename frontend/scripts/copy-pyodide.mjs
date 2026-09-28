// Copies the Pyodide runtime from node_modules into public/pyodide, so the
// labs load Python from purvex.io itself and never from a third-party CDN.
// Runs before dev and build. The copied files are not committed.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const from = dirname(require.resolve("pyodide/package.json"));
const to = join(process.cwd(), "public", "pyodide");
const files = ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];

mkdirSync(to, { recursive: true });
for (const f of files) {
  const src = join(from, f);
  if (!existsSync(src)) throw new Error(`Pyodide file missing: ${f}`);
  copyFileSync(src, join(to, f));
}
console.log(`Copied Pyodide runtime to ${to}`);
