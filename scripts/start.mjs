import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dnsInit = pathToFileURL(path.join(__dirname, "dns-init.mjs")).href;
const currentOptions = process.env.NODE_OPTIONS || "";
const importOption = `--import=${dnsInit}`;
const nodeOptions = currentOptions.includes("dns-init.mjs")
  ? currentOptions
  : [currentOptions, importOption].filter(Boolean).join(" ");

const mode = process.argv[2];
const args = mode === "dev" || mode === "build" ? [mode] : ["start"];
const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));

const child = spawn(process.execPath, [nextBin, ...args], {
  stdio: "inherit",
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
});

child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
