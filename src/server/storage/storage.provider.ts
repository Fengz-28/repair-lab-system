export type PrivateFileInput = {
  originalName: string;
  mimeType: string;
  byteSize: number;
  buffer: Buffer;
  metadata?: Record<string, unknown>;
};

export type StoredPrivateFile = {
  storageKey: string;
  checksum?: string;
  byteSize: number;
  mimeType: string;
};

export type PrivateFileAccess = {
  streamUrl?: string;
  expiresAt?: Date;
};

export interface StorageProvider {
  putPrivateFile(input: PrivateFileInput): Promise<StoredPrivateFile>;
  getPrivateFileAccess(storageKey: string): Promise<PrivateFileAccess>;
  deletePrivateFile(storageKey: string): Promise<void>;
}

