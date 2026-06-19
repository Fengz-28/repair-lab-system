import "server-only";

import path from "path";

const forbiddenStorageRootSegments = new Set(["public", ".next", "src", "prisma"]);

export function privateStorageRoot() {
  const configuredRoot = process.env.PRIVATE_STORAGE_ROOT || "./storage/private";
  const root = path.resolve(/*turbopackIgnore: true*/ process.cwd(), configuredRoot);
  const relative = path.relative(/*turbopackIgnore: true*/ process.cwd(), root);
  const firstSegment = relative.split(path.sep)[0];

  if (!relative) {
    throw new Error("PRIVATE_STORAGE_ROOT cannot be the project root.");
  }

  if (!relative.startsWith("..") && forbiddenStorageRootSegments.has(firstSegment)) {
    throw new Error(`PRIVATE_STORAGE_ROOT cannot be inside ${firstSegment}.`);
  }

  return root;
}
