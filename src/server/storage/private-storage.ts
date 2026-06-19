import "server-only";

import { createHash, randomUUID } from "crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "fs/promises";
import path from "path";

export type PrivateUploadFile = {
  originalName: string;
  mimeType: string;
  byteSize: number;
  bytes: Uint8Array;
};

export type StoredPrivateFile = {
  storageKey: string;
  originalName: string;
  mimeType: string;
  byteSize: number;
  checksum: string;
};

export type PrivateFileReadResult = {
  absolutePath: string;
  bytes: Buffer;
  size: number;
};

const defaultAllowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const allowedExtensionsByMimeType: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
};

const forbiddenStorageRootSegments = new Set(["public", ".next", "src", "prisma"]);

export function maxUploadFileSizeBytes() {
  return readPositiveInt("MAX_UPLOAD_FILE_SIZE_MB", 10) * 1024 * 1024;
}

export function maxUploadFilesPerIntake() {
  return readPositiveInt("MAX_UPLOAD_FILES_PER_INTAKE", 12);
}

export function maxUploadFilesPerTicket() {
  return readPositiveInt("MAX_UPLOAD_FILES_PER_TICKET", 8);
}

export function allowedUploadMimeTypes() {
  const configured = process.env.ALLOWED_UPLOAD_MIME_TYPES?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return configured && configured.length > 0 ? configured : defaultAllowedMimeTypes;
}

export function validateUploadFile(file: Pick<PrivateUploadFile, "originalName" | "mimeType" | "byteSize">) {
  if (!file.originalName.trim()) {
    throw new Error("El archivo debe tener nombre.");
  }

  if (file.byteSize <= 0) {
    throw new Error("El archivo esta vacio.");
  }

  const maxBytes = maxUploadFileSizeBytes();

  if (file.byteSize > maxBytes) {
    throw new Error(`El archivo ${file.originalName} supera el maximo permitido.`);
  }

  const mimeType = file.mimeType || "application/octet-stream";
  const allowedMimeTypes = allowedUploadMimeTypes();

  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error(`El tipo de archivo ${mimeType} no esta permitido.`);
  }

  const extension = path.extname(file.originalName).toLowerCase();
  const allowedExtensions = allowedExtensionsByMimeType[mimeType] ?? [];

  if (!allowedExtensions.includes(extension)) {
    throw new Error(`La extension ${extension || "(sin extension)"} no coincide con el tipo permitido.`);
  }
}

export function buildStorageKey(scope: "intakes" | "tickets", originalName: string) {
  const now = new Date();
  const datePath = [
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("/");
  const extension = path.extname(originalName).toLowerCase();
  const safeBaseName =
    path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || "file";

  return `${scope}/${datePath}/${randomUUID()}-${safeBaseName}${extension}`;
}

export async function savePrivateFile(scope: "intakes" | "tickets", file: PrivateUploadFile) {
  validateUploadFile(file);

  const storageKey = buildStorageKey(scope, file.originalName);
  const absolutePath = resolveStorageKey(storageKey);
  const bytes = Buffer.from(file.bytes);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes, { flag: "wx" });

  return {
    storageKey,
    originalName: file.originalName,
    mimeType: file.mimeType,
    byteSize: file.byteSize,
    checksum: createHash("sha256").update(bytes).digest("hex"),
  } satisfies StoredPrivateFile;
}

export async function getPrivateFile(storageKey: string): Promise<PrivateFileReadResult> {
  const absolutePath = resolveStorageKey(storageKey);
  const [bytes, fileStat] = await Promise.all([readFile(absolutePath), stat(absolutePath)]);

  if (!fileStat.isFile()) {
    throw new Error("Private file is not a regular file.");
  }

  return {
    absolutePath,
    bytes,
    size: fileStat.size,
  };
}

export async function deletePrivateFile(storageKey: string) {
  try {
    await unlink(resolveStorageKey(storageKey));
  } catch (error) {
    if (isNotFoundError(error)) {
      return;
    }

    throw error;
  }
}

export async function deletePrivateFiles(storageKeys: string[]) {
  await Promise.all(storageKeys.map((storageKey) => deletePrivateFile(storageKey)));
}

function resolveStorageKey(storageKey: string) {
  if (!storageKey || path.isAbsolute(storageKey) || storageKey.includes("\0")) {
    throw new Error("Invalid private storage key.");
  }

  const normalizedKey = path.normalize(storageKey);

  if (normalizedKey.startsWith("..") || path.isAbsolute(normalizedKey)) {
    throw new Error("Invalid private storage key.");
  }

  const root = privateStorageRoot();
  const absolutePath = path.resolve(root, normalizedKey);

  if (!absolutePath.startsWith(`${root}${path.sep}`)) {
    throw new Error("Invalid private storage key.");
  }

  return absolutePath;
}

export function privateStorageRoot() {
  const configuredRoot = process.env.PRIVATE_STORAGE_ROOT || "./storage/private";
  const root = path.resolve(process.cwd(), configuredRoot);
  const relative = path.relative(process.cwd(), root);
  const firstSegment = relative.split(path.sep)[0];

  if (!relative) {
    throw new Error("PRIVATE_STORAGE_ROOT cannot be the project root.");
  }

  if (!relative.startsWith("..") && forbiddenStorageRootSegments.has(firstSegment)) {
    throw new Error(`PRIVATE_STORAGE_ROOT cannot be inside ${firstSegment}.`);
  }

  return root;
}

function readPositiveInt(name: string, fallback: number) {
  const raw = process.env[name];
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function isNotFoundError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
