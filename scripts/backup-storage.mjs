import "dotenv/config";

import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const storageRoot = path.resolve(process.cwd(), process.env.PRIVATE_STORAGE_ROOT || "./storage/private");
const outputDir = path.resolve(process.cwd(), "backups", "storage");

await mkdir(outputDir, { recursive: true });

if (!(await exists(storageRoot))) {
  const marker = path.join(outputDir, `repairlab-storage-empty-${timestamp()}.txt`);
  await writeFile(marker, "Storage root does not exist. No private files were backed up.\n", {
    flag: "wx",
  });
  console.log(`Storage root not found. Wrote marker: ${path.relative(process.cwd(), marker)}`);
  process.exit(0);
}

if (!(await hasFiles(storageRoot))) {
  const marker = path.join(outputDir, `repairlab-storage-empty-${timestamp()}.txt`);
  await writeFile(marker, "Storage root exists but contains no files.\n", { flag: "wx" });
  console.log(`Storage root is empty. Wrote marker: ${path.relative(process.cwd(), marker)}`);
  process.exit(0);
}

const outputFile = path.join(outputDir, `repairlab-storage-${timestamp()}.tar.gz`);
const parent = path.dirname(storageRoot);
const basename = path.basename(storageRoot);

console.log(`Creating storage backup in ${path.relative(process.cwd(), outputFile)}...`);

let tar;
try {
  tar = spawn("tar", ["-czf", outputFile, "-C", parent, basename], {
    stdio: ["ignore", "ignore", "pipe"],
  });
} catch (error) {
  throw new Error(
    `Storage backup failed. Ensure tar is available and allowed to run on Windows. ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
}

let stderr = "";
tar.stderr.on("data", (chunk) => {
  stderr += chunk.toString();
});

const exitCode = await new Promise((resolve, reject) => {
  tar.on("error", reject);
  tar.on("close", (code) => resolve(code ?? 1));
});

if (exitCode !== 0) {
  await rm(outputFile, { force: true });
  throw new Error(`Storage backup failed. Ensure tar is available on Windows. ${stderr.trim()}`);
}

const fileStat = await stat(outputFile);
console.log(`Storage backup created: ${path.relative(process.cwd(), outputFile)} (${fileStat.size} bytes)`);

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function hasFiles(target) {
  const entries = await readdir(target, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(target, entry.name);

    if (entry.isFile()) {
      return true;
    }

    if (entry.isDirectory() && (await hasFiles(entryPath))) {
      return true;
    }
  }

  return false;
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}
