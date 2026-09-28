// Runs a student's Python in Pyodide, in a module worker off the page.
// A worker has no DOM and cannot read the page's cookies or storage, and
// once Python has loaded this one also gives up its network access, so the
// code it runs can only print. The page stops it if it runs too long.
import { loadPyodide } from "/pyodide/pyodide.mjs";

const NETWORK = ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts"];
let ready = null;

async function boot() {
  const py = await loadPyodide({ indexURL: "/pyodide/" });
  for (const name of NETWORK) {
    try {
      Object.defineProperty(self, name, { value: undefined, writable: false, configurable: false });
    } catch {
      self[name] = undefined;
    }
  }
  return py;
}

self.onmessage = async (event) => {
  const { id, code, files } = event.data ?? {};
  if (typeof code !== "string") return;
  let out = "";
  try {
    ready ??= boot();
    const py = await ready;
    self.postMessage({ id, type: "running" });
    py.setStdout({ batched: (line) => (out += line + "\n") });
    py.setStderr({ batched: (line) => (out += line + "\n") });
    for (const [name, text] of Object.entries(files ?? {})) {
      if (/^[a-z0-9_.-]+$/i.test(name) && typeof text === "string") py.FS.writeFile(name, text);
    }
    await py.runPythonAsync(code);
    self.postMessage({ id, type: "done", ok: true, out: out.slice(0, 20000) });
  } catch (err) {
    // Keep the end of a traceback, where Python names the actual error.
    const msg = String(err?.message ?? err);
    self.postMessage({ id, type: "done", ok: false, out: (out + msg).slice(-4000) });
  }
};
