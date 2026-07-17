import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import process from "node:process";

const frontendDir = process.cwd();
const backendDir = path.resolve(frontendDir, "..", "backend");

const isWindows = process.platform === "win32";
const pythonCmd = "python";
const npmCmd = isWindows ? "npm.cmd" : "npm";

let shuttingDown = false;
const children = [];

function startProcess(name, command, args, cwd) {
  const child = isWindows
    ? spawn("cmd.exe", ["/d", "/s", "/c", command, ...args], { cwd, stdio: "inherit", env: process.env })
    : spawn(command, args, { cwd, stdio: "inherit", env: process.env });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    for (const proc of children) {
      if (proc !== child && !proc.killed) {
        proc.kill("SIGTERM");
      }
    }
    const reason = signal ? `${name} exited via ${signal}` : `${name} exited with code ${code ?? 0}`;
    process.exitCode = code ?? 1;
    console.error(reason);
  });

  children.push(child);
  return child;
}

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
  setTimeout(() => process.exit(0), 250);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

function removePath(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function isPortListening(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
}

async function main() {
  const backendRunning = await isPortListening(8001, "127.0.0.1");
  if (backendRunning) {
    console.log("Backend already running on http://127.0.0.1:8001; skipping backend startup.");
  } else {
    startProcess("backend", pythonCmd, ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8001"], backendDir);
  }

  const nextLockPath = path.join(frontendDir, ".next", "dev", "lock");
  const nextDevPath = path.join(frontendDir, ".next", "dev");
  const frontendRunning =
    (await isPortListening(3000, "127.0.0.1")) ||
    (await isPortListening(3001, "127.0.0.1"));
  if (frontendRunning) {
    console.log("Frontend already running for this workspace; skipping frontend startup.");
    return;
  }
  if (fs.existsSync(nextLockPath)) {
    removePath(nextDevPath);
    console.log("Removed stale Next.js dev cache; starting frontend.");
  }

  removePath(path.join(frontendDir, ".next", "dev", "cache"));

  startProcess("frontend", npmCmd, ["run", "dev:frontend"], frontendDir);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
