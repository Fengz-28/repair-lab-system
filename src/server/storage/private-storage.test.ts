import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildStorageKey,
  maxUploadFileSizeBytes,
  privateStorageRoot,
  validateUploadFile,
} from "./private-storage";

const originalPrivateStorageRoot = process.env.PRIVATE_STORAGE_ROOT;
const originalMaxUploadFileSize = process.env.MAX_UPLOAD_FILE_SIZE_MB;

describe("private storage safety", () => {
  afterEach(() => {
    process.env.PRIVATE_STORAGE_ROOT = originalPrivateStorageRoot;
    process.env.MAX_UPLOAD_FILE_SIZE_MB = originalMaxUploadFileSize;
  });

  it("rejects invalid files before storage", () => {
    expect(() =>
      validateUploadFile({
        originalName: "repair.exe",
        mimeType: "application/octet-stream",
        byteSize: 10,
      }),
    ).toThrow("no esta permitido");

    expect(() =>
      validateUploadFile({
        originalName: "photo.jpg",
        mimeType: "image/png",
        byteSize: 10,
      }),
    ).toThrow("no coincide");
  });

  it("uses the configured max upload size", () => {
    process.env.MAX_UPLOAD_FILE_SIZE_MB = "1";

    expect(maxUploadFileSizeBytes()).toBe(1024 * 1024);
    expect(() =>
      validateUploadFile({
        originalName: "large.pdf",
        mimeType: "application/pdf",
        byteSize: 1024 * 1024 + 1,
      }),
    ).toThrow("supera el maximo");
  });

  it("sanitizes generated storage keys", () => {
    const storageKey = buildStorageKey("tickets", "../Mi foto rara!!.jpg");

    expect(storageKey).toMatch(/^tickets\/\d{4}\/\d{2}\/\d{2}\//);
    expect(storageKey).toContain(".jpg");
    expect(storageKey).not.toContain("..");
    expect(storageKey).not.toContain(" ");
  });

  it("rejects unsafe private storage roots", () => {
    process.env.PRIVATE_STORAGE_ROOT = ".";
    expect(() => privateStorageRoot()).toThrow("project root");

    process.env.PRIVATE_STORAGE_ROOT = "./public/private";
    expect(() => privateStorageRoot()).toThrow("public");
  });
});
