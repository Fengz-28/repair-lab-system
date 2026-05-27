import { spawn } from "node:child_process";

const tasks = [
  "backup:db",
  "backup:storage",
];

const results = [];

for (const name of tasks) {
  console.log(`Running ${name}...`);
  const code = await runNpmScript(name);
  results.push({ name, ok: code === 0 });
}

console.log("\nBackup summary:");
for (const result of results) {
  console.log(`- ${result.name}: ${result.ok ? "OK" : "FAILED"}`);
}

if (results.some((result) => !result.ok)) {
  process.exit(1);
}

function runNpmScript(scriptName) {
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args =
    process.platform === "win32"
      ? ["/d", "/s", "/c", "npm", "run", scriptName]
      : ["run", scriptName];

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });
}
