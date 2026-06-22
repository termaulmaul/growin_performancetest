import { spawn } from "bun";

console.log("\x1b[36m[PT-WebUI]\x1b[0m Starting backend API server (port 3001)...");
const backend = spawn(["bun", "run", "--watch", "server.ts"], {
  stdout: "inherit",
  stderr: "inherit",
});

console.log("\x1b[36m[PT-WebUI]\x1b[0m Starting Vite frontend...");
// Pass any extra args like --host to vite
const args = process.argv.slice(2);
const frontend = spawn(["bun", "x", "vite", ...args], {
  stdout: "inherit",
  stderr: "inherit",
});

const cleanup = () => {
  console.log("\x1b[31m[PT-WebUI]\x1b[0m Shutting down servers...");
  backend.kill();
  frontend.kill();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
