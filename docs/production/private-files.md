# Section E - Private File Storage

Status: audited with two small hardening fixes.

## Current provider and storage location

The current provider is local filesystem private storage.

- Default root: `./storage/private`
- Configurable root: `PRIVATE_STORAGE_ROOT`
- Docker compose root: `/app/storage/private`
- Docker volume: `repair_lab_storage:/app/storage/private`

This section did not migrate storage to S3, R2, MinIO, or any cloud provider.

## Public/private boundary

Private customer and repair files are not stored under `public/`.

`privateStorageRoot()` rejects roots inside:

- `public`
- `.next`
- `src`
- `prisma`

Section E also hardened this function so `PRIVATE_STORAGE_ROOT` cannot be the project root itself.

## Upload validation

Current upload validation includes:

- Max file size from `MAX_UPLOAD_FILE_SIZE_MB` with default `10`.
- Max intake file count from `MAX_UPLOAD_FILES_PER_INTAKE` with default `12`.
- Max ticket file count from `MAX_UPLOAD_FILES_PER_TICKET` with default `8`.
- MIME allowlist from `ALLOWED_UPLOAD_MIME_TYPES`.
- Default MIME allowlist:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `application/pdf`
- Extension matching by MIME type.
- Original filename required.
- Empty files rejected.
- Stored filenames generated from UUID plus sanitized base name.
- Writes use exclusive create (`wx`) to avoid overwriting existing files.

Section E added cumulative ticket file count enforcement before adding a ticket attachment.

## Path traversal protection

Storage keys are server-generated and resolved server-side.

`resolveStorageKey()` rejects:

- empty keys;
- absolute paths;
- null bytes;
- normalized keys starting with `..`;
- resolved paths outside the private storage root.

Admin download routes accept `FileAsset.id`, not raw filesystem paths.

## Metadata in PostgreSQL

File metadata remains in PostgreSQL through `FileAsset`.

Tracked metadata includes:

- `storageKey`
- `originalName`
- `mimeType`
- `byteSize`
- `checksum`
- `visibility`
- `intakeId`
- `ticketId`
- `deletedAt`

Binary file contents stay in private filesystem storage.

## Download and preview authorization

Private file access route:

- `/admin/files/[fileAssetId]`

Authorization and safety checks:

- Calls `requireLocalStaff()`.
- Loads file metadata by `FileAsset.id`.
- Rejects deleted files.
- Only serves records with `visibility === "PRIVATE"`.
- Requires an associated ticket or intake.
- Uses `Cache-Control: private, no-store`.
- Sanitizes filename before writing `Content-Disposition`.
- Serves images/PDF inline and other files as attachments.

No public customer portal route serves private file assets.

## Backup implications

Storage backup script:

- `npm run backup:storage`
- script: `scripts/backup-storage.mjs`
- reads `PRIVATE_STORAGE_ROOT`;
- writes compressed backups under `backups/storage`;
- writes marker files when storage is missing or empty.

Production still needs:

- external backup destination;
- retention policy;
- monitoring for backup success/failure;
- periodic restore test.

## Gaps fixed

- `PRIVATE_STORAGE_ROOT` can no longer point at the project root.
- Ticket attachments now enforce `MAX_UPLOAD_FILES_PER_TICKET` cumulatively.

## Deferred risks

- File content is not scanned for malware.
- MIME type is trusted from upload metadata plus extension matching; deeper file signature validation is deferred.
- Local filesystem storage requires a persistent VPS volume.
- Multi-instance deployments need shared storage or a future storage provider.
- Backup script is local/manual and needs production scheduling plus offsite copy.
