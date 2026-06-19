# Safe Restore Drill Plan

Status: planning document only. Home-hosted tunnel notes added. No restore command has been executed.

## Purpose

Use this drill to prove that FengzLab / RepairLab backups can be restored without risking active workshop data.

The drill must restore into temporary targets only:

- temporary PostgreSQL database;
- temporary private storage directory;
- explicit approval before any command that points the app at restored data.

This document is a safety procedure, not an automation script.

## Required backup artifacts

Before starting, identify the exact artifacts to test:

```txt
backups/postgres/repairlab-postgres-<timestamp>.sql.gz
backups/storage/repairlab-storage-<timestamp>.tar.gz
```

Required checks:

- [ ] Backup files exist.
- [ ] Backup files are outside Git.
- [ ] Backup timestamp is known.
- [ ] Backup source environment is known.
- [ ] No `.env` file or secret bundle is inside the backup artifact.
- [ ] Storage backup corresponds to the same general time window as the DB backup.

## Required approvals

Restore drills are potentially dangerous. Before running the drill, record approval for:

- the source backup artifact;
- the temporary database name;
- the temporary storage path;
- whether the app may point to the temporary restore target for smoke testing.

Do not restore over the active database.

Do not restore into the active private storage root.

Do not connect the public production app to a restore target unless explicitly approved.

## Temporary target naming

Recommended temporary database:

```txt
repairlab_restore_test_<YYYYMMDD>
```

Examples:

```txt
repairlab_restore_test_20260614
repairlab_restore_test_20260614_01
```

Recommended temporary storage path:

```txt
storage/restore-drills/<YYYYMMDD>/
```

Examples:

```txt
storage/restore-drills/20260614/private
storage/restore-drills/20260614-01/private
```

The temporary names must be visibly different from the production database and production private storage path.

## Pre-drill safety checklist

- [ ] Confirm current app is not pointed at the temporary restore target.
- [ ] Confirm current production/staging database name.
- [ ] Confirm current `PRIVATE_STORAGE_ROOT`.
- [ ] Run or confirm a fresh backup of active data if the drill is on a real server.
- [ ] Confirm no staff member is relying on the temporary target.
- [ ] Confirm there is enough disk space for DB dump extraction and storage extraction.
- [ ] Confirm rollback plan if an operator accidentally points the app at the wrong target.

## Example commands

These commands are examples only. Adjust usernames, database names, container names, and paths for the actual environment.

Validate compressed DB backup:

```txt
gzip -t backups/postgres/<backup>.sql.gz
```

Create temporary database:

```txt
docker exec repair_lab_postgres psql -U repairlab -d postgres -c "CREATE DATABASE repairlab_restore_test_YYYYMMDD OWNER repairlab;"
```

Copy DB backup into the PostgreSQL container:

```txt
docker cp backups/postgres/<backup>.sql.gz repair_lab_postgres:/tmp/repairlab_restore_test.sql.gz
```

Validate inside the container:

```txt
docker exec repair_lab_postgres gzip -t /tmp/repairlab_restore_test.sql.gz
```

Restore into temporary DB:

```txt
docker exec repair_lab_postgres sh -c "gzip -dc /tmp/repairlab_restore_test.sql.gz | psql -U repairlab -d repairlab_restore_test_YYYYMMDD"
```

Extract storage into temporary directory:

```txt
mkdir -p storage/restore-drills/YYYYMMDD
tar -xzf backups/storage/<backup>.tar.gz -C storage/restore-drills/YYYYMMDD
```

Do not run these commands against active production targets.

## Validation checklist

Database validation:

- [ ] Temporary DB exists.
- [ ] Temporary DB accepts a connection.
- [ ] Prisma can connect when `DATABASE_URL` is intentionally pointed at the temporary DB.
- [ ] Sample tickets are visible in the temporary DB.
- [ ] Sample customers/devices are visible in the temporary DB.
- [ ] Quote, invoice, payment, file metadata, and timeline records exist where expected.
- [ ] No secret values were printed to terminal output or logs during validation.

Private storage validation:

- [ ] Temporary storage directory exists.
- [ ] Expected files are present.
- [ ] File paths match the shape expected by `FileAsset.storageKey`.
- [ ] No restored files are placed under `public/`.
- [ ] No restored files are served directly without authorization.

Application smoke validation, only if explicitly approved:

- [ ] Start app with temporary `DATABASE_URL`.
- [ ] Start app with temporary `PRIVATE_STORAGE_ROOT`.
- [ ] Check `/api/health`.
- [ ] Log in with a test/staging staff account only.
- [ ] Open one restored ticket.
- [ ] Confirm private file download remains staff-protected.
- [ ] Stop the temporary app immediately after validation.

## Cleanup steps

After validation:

1. Stop any temporary app process pointed at the restore target.
2. Drop the temporary database.
3. Delete temporary copied backup files inside the database container.
4. Delete the temporary storage restore directory.
5. Confirm the active app still points to the normal database and private storage root.
6. Record drill result, date, backup artifact names, and any failures.

Example temporary DB cleanup:

```txt
docker exec repair_lab_postgres psql -U repairlab -d postgres -c "DROP DATABASE repairlab_restore_test_YYYYMMDD;"
```

Example temporary storage cleanup:

```txt
Remove-Item -Recurse -LiteralPath storage/restore-drills/YYYYMMDD
```

Use the platform-appropriate command and verify the resolved path before deleting.

## Forbidden actions

Never do these during a restore drill:

- restore over the active production database;
- extract storage into the active private upload root;
- run restore without verifying the backup artifact first;
- run restore without a clearly named temporary target;
- run restore while unsure which environment is active;
- publish restored customer files;
- paste real secrets into documentation, prompts, screenshots, or issue comments;
- leave a temporary app connected to restored data after the drill;
- treat an untested backup as production-ready.

## Success criteria

The drill is successful when:

- DB backup decompresses and restores into a temporary database;
- private storage backup extracts into a temporary directory;
- representative records and files can be verified;
- no active data was overwritten;
- no secrets or private files were exposed;
- cleanup is completed;
- results are recorded.

## Result log template

Use this template after each drill:

```txt
Date:
Operator:
Environment:
DB backup artifact:
Storage backup artifact:
Temporary database:
Temporary storage path:
Validation result:
Issues found:
Cleanup completed:
Follow-up actions:
```

## Current production implication

Until this drill succeeds against temporary targets, FengzLab / RepairLab should remain:

```txt
GO for staging with conditions.
NO-GO for final production with real customer data.
```

## Home-hosted restore drill notes

For the current tunnel setup, the restore drill should stay local and temporary.

Recommended target shape:

- temporary database: `repairlab_restore_test_<YYYYMMDD>` inside the local PostgreSQL container;
- temporary storage: `storage/restore-drills/<YYYYMMDD>/private`;
- temporary app process only if explicitly approved and pointed at the temporary targets.

Extra checks for home-hosted operation:

- [ ] Confirm the active app on port `3001` is stopped or not pointed at restore targets.
- [ ] Confirm Cloudflare Tunnel is not routing public users to a temporary restore app.
- [ ] Confirm no real customer is using staging during the drill.
- [ ] Confirm backup artifacts are copied elsewhere before testing restore.
- [ ] Confirm temporary restore folders are outside `public/`.
- [ ] Confirm cleanup restores the normal `.env` values and active storage path.

Do not use Cloudflare Tunnel as part of the restore drill unless the user explicitly approves a temporary smoke test. Restore validation should work locally first.
