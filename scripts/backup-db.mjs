import "dotenv/config";

import { createGzip } from "node:zlib";
import { createWriteStream } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const containerName = process.env.POSTGRES_CONTAINER_NAME || "repair_lab_postgres";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for database backups.");
}

const parsedUrl = new URL(databaseUrl);
const database = parsedUrl.pathname.replace(/^\//, "");
const username = decodeURIComponent(parsedUrl.username || "repairlab");
const password = decodeURIComponent(parsedUrl.password || "");
const outputDir = path.resolve(process.cwd(), "backups", "postgres");
const outputFile = path.join(outputDir, `repairlab-postgres-${timestamp()}.sql.gz`);

await mkdir(outputDir, { recursive: true });

const args = [
  "exec",
  "-e",
  "PGPASSWORD",
  containerName,
  "pg_dump",
  "-U",
  username,
  "-d",
  database,
  "--no-owner",
  "--no-privileges",
];

console.log(`Creating PostgreSQL backup in ${path.relative(process.cwd(), outputFile)}...`);

let docker;
try {
  docker = spawn("docker", args, {
    env: {
      ...process.env,
      PGPASSWORD: password,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (error) {
  await rm(outputFile, { force: true });
  throw new Error(
    `Database backup failed. Ensure Docker Desktop is running and the docker CLI is available. ${cleanError(
      error instanceof Error ? error.message : String(error),
    )}`,
  );
}
const gzip = createGzip({ level: 9 });
const output = createWriteStream(outputFile, { flags: "wx" });

docker.stdout.pipe(gzip).pipe(output);

let stderr = "";
docker.stderr.on("data", (chunk) => {
  stderr += chunk.toString();
});

const exitCode = await new Promise((resolve, reject) => {
  docker.on("error", reject);
  output.on("error", reject);
  output.on("finish", () => resolve(docker.exitCode ?? 0));
  docker.on("close", (code) => {
    if (code !== 0) {
      gzip.destroy();
      output.destroy();
      resolve(code ?? 1);
    }
  });
});

if (exitCode !== 0) {
  await rm(outputFile, { force: true });
  throw new Error(`Database backup failed. Ensure Docker Desktop is running and ${containerName} is available. ${cleanError(stderr)}`);
}

const fileStat = await stat(outputFile);
console.log(`Database backup created: ${path.relative(process.cwd(), outputFile)} (${fileStat.size} bytes)`);

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function cleanError(value) {
  return value.replace(password, "[redacted]").trim();
}
