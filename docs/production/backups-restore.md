# Section G - Backups and Restore

Status: audited and documented. Home-hosted tunnel notes added. No runtime logic changed.

## Current backup commands

Database backup:

```txt
npm run backup:db
```

Private storage backup:

```txt
npm run backup:storage
```

Full local backup:

```txt
npm run backup
```

`npm run backup` runs the database backup first and the private storage backup second.

## Current backup outputs

Database backups:

```txt
backups/postgres/repairlab-postgres-<timestamp>.sql.gz
```

Private storage backups:

```txt
backups/storage/repairlab-storage-<timestamp>.tar.gz
```

If private storage is missing or empty, the storage backup script writes a marker file under `backups/storage`.

The `backups/` directory is ignored by Git except `.gitkeep` files.

## PostgreSQL backup behavior

`scripts/backup-db.mjs`:

- reads `DATABASE_URL`;
- reads `POSTGRES_CONTAINER_NAME`, defaulting to `repair_lab_postgres`;
- runs `pg_dump` inside the Docker PostgreSQL container;
- uses `--no-owner` and `--no-privileges`;
- compresses output with gzip level 9;
- writes to `backups/postgres`;
- redacts the database password from error messages.

Requirements:

- Docker is running.
- The PostgreSQL container exists and is reachable.
- `DATABASE_URL` points to the database to back up.

## Private storage backup behavior

`scripts/backup-storage.mjs`:

- reads `PRIVATE_STORAGE_ROOT`, defaulting to `./storage/private`;
- uses `tar -czf`;
- writes to `backups/storage`;
- does not read `.env`;
- does not include application secrets unless secrets were incorrectly placed inside the private storage directory.

Requirements:

- `tar` is available.
- `PRIVATE_STORAGE_ROOT` points to the intended private storage root.

## What is not backed up

The current local scripts do not back up:

- `.env`;
- external secrets;
- Docker image layers;
- node modules;
- logs outside `backups/`;
- OS-level config;
- reverse proxy/TLS config;
- offsite copies.

This is intentional for secrets. Secrets must be stored and restored through a separate secure secrets process.

## Restore procedure

Do not restore over active workshop data without a fresh backup and explicit approval.

Recommended safe restore drill:

1. Stop the app or ensure no staff is writing data.
2. Run a fresh backup of current DB and storage.
3. Restore PostgreSQL into a temporary database, not the active database.
4. Validate the dump with `gzip -t`.
5. Run Prisma/client smoke checks against the temporary database.
6. Extract storage into a temporary directory.
7. Confirm expected files exist and paths match `FileAsset.storageKey`.
8. Delete temporary restore data after verification.

The project already documents a successful restore test in `docs/BACKUP_AND_RESTORE.md`.

## PostgreSQL restore reference

Conceptual local restore to a temporary DB:

```txt
docker exec repair_lab_postgres psql -U repairlab -d postgres -c "CREATE DATABASE repairlab_restore_test OWNER repairlab;"
docker cp backups/postgres/<backup>.sql.gz repair_lab_postgres:/tmp/repairlab_restore_test.sql.gz
docker exec repair_lab_postgres gzip -t /tmp/repairlab_restore_test.sql.gz
docker exec repair_lab_postgres sh -c "gzip -dc /tmp/repairlab_restore_test.sql.gz > /tmp/repairlab_restore_test.sql"
docker exec repair_lab_postgres psql -U repairlab -d repairlab_restore_test -f /tmp/repairlab_restore_test.sql
```

Never run a restore into the active database unless the active data can be replaced.

## Private storage restore reference

Safe local restore drill:

1. Extract a storage backup into a temporary folder.
2. Confirm the archive contains the expected storage root folder.
3. Compare a sample `FileAsset.storageKey` with an extracted file path.
4. Only replace `storage/private` after taking a fresh copy of the current folder.

Do not overwrite `storage/private` directly as the first restore step.

## Local retention recommendation

For local/VPS single-instance use:

- keep at least 7 daily backups;
- keep at least 4 weekly backups;
- keep at least 3 monthly backups while the workshop is active;
- regularly delete older local backups only after confirming an external copy exists.

This is a recommendation, not an automated policy. No retention deletion script was added in Section G.

## External encrypted backup recommendation

Production should copy both database and storage backups to an external encrypted destination.

Provider choice is deferred. Acceptable future options include:

- encrypted VPS-to-VPS copy;
- encrypted object storage;
- encrypted local NAS copy;
- managed backup tool with encryption and alerts.

Minimum requirements for the future external destination:

- encryption at rest;
- credentials outside the repo;
- restore test support;
- retention policy;
- alerting on failed backup;
- separate copy of PostgreSQL and private storage from the same time window.

## Restore test policy

Before production use:

- run one full restore drill against a temporary database and temporary storage folder;
- document backup filenames used;
- document date, operator, and result;
- verify at least one admin page, one ticket, one customer, one invoice/payment, and one private file.

After production use starts:

- run a restore drill monthly during early operation;
- run a restore drill after changing backup scripts, Docker volumes, or storage path;
- treat an untested backup as incomplete protection.

## Deferred risks

- No automated offsite upload exists.
- No encryption automation exists.
- No retention script exists.
- No restore script exists because automated restore is destructive without explicit target and approval.
- No backup monitoring/alerting exists yet.
- `docker-compose.yml` is still local/demo, not final production deployment design.

## Home-hosted tunnel backup policy

For the current Cloudflare Tunnel setup, the local workstation is also the temporary server. Treat it like production hardware during any real workshop use.

Before entering real repair/customer data through `https://staging.fengzlab.tech`:

- [ ] Run `npm run backup:db`.
- [ ] Run `npm run backup:storage`.
- [ ] Confirm both backup artifacts exist under `backups/`.
- [ ] Copy the backup artifacts to at least one external encrypted location.
- [ ] Confirm the external copy is not inside the Git working tree.
- [ ] Record the backup timestamp before starting real work.

Recommended early cadence while home-hosted:

- run a full backup before each public/staging validation session;
- run a full backup after any day with real workshop data;
- copy backups off the workstation the same day;
- do not rely on the workstation disk as the only copy.

Do not include `.env`, secrets, browser sessions, Cloudflare credentials, or personal files in application backups.
