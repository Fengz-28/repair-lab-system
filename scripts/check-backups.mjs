import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const freshnessHours = readPositiveInt("BACKUP_FRESHNESS_HOURS", 72);

const backupSpecs = [
  {
    label: "PostgreSQL",
    dir: path.join(root, "backups", "postgres"),
    pattern: /^repairlab-postgres-.+\.sql\.gz$/,
  },
  {
    label: "Private storage",
    dir: path.join(root, "backups", "storage"),
    pattern: /^repairlab-storage-.+\.tar\.gz$/,
  },
];

let failures = 0;

console.log(`Checking backup presence and freshness (threshold: ${freshnessHours}h).`);

for (const spec of backupSpecs) {
  const latest = await findLatestBackup(spec.dir, spec.pattern);

  if (!latest) {
    failures += 1;
    console.error(`[MISSING] ${spec.label}: no matching backup found in ${relativePath(spec.dir)}`);
    continue;
  }

  const ageHours = (Date.now() - latest.mtimeMs) / 1000 / 60 / 60;
  const ageLabel = ageHours < 48 ? `${ageHours.toFixed(1)}h` : `${(ageHours / 24).toFixed(1)}d`;
  const sizeLabel = formatBytes(latest.size);
  const status = ageHours > freshnessHours ? "STALE" : "OK";

  if (status === "STALE") {
    failures += 1;
  }

  const printer = status === "OK" ? console.log : console.error;
  printer(
    `[${status}] ${spec.label}: ${relativePath(latest.path)} (${sizeLabel}, modified ${latest.mtime.toISOString()}, age ${ageLabel})`,
  );
}

if (failures > 0) {
  console.error("Backup check failed. Create fresh backups before relying on restore readiness.");
  process.exitCode = 1;
} else {
  console.log("Backup check passed.");
}

async function findLatestBackup(dir, pattern) {
  if (!existsSync(dir)) {
    return null;
  }

  const names = await readdir(dir);
  const matches = [];

  for (const name of names) {
    if (!pattern.test(name)) {
      continue;
    }

    const filePath = path.join(dir, name);
    const info = await stat(filePath);

    if (!info.isFile()) {
      continue;
    }

    matches.push({
      path: filePath,
      mtime: info.mtime,
      mtimeMs: info.mtimeMs,
      size: info.size,
    });
  }

  matches.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return matches[0] ?? null;
}

function readPositiveInt(name, fallback) {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) {
    console.warn(`Ignoring invalid ${name}; using ${fallback}.`);
    return fallback;
  }

  return value;
}

function relativePath(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/") || ".";
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
