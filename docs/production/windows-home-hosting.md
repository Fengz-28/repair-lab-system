# Windows Home-Hosted Production Readiness

Status: home-hosted early production checklist for the local Windows workstation. This does not replace a VPS deployment plan.

FengzLab can run temporarily from the local workstation through Cloudflare Tunnel, with the tunnel pointing to `http://localhost:3001`. Treat this machine like production hardware whenever real workshop data is present.

## Safe commands

Read-only readiness check:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/check-local-production.ps1
```

Start the already-built app on port `3001`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-local-production.ps1
```

The start script does not install services, change firewall rules, modify Cloudflare, or edit `.env`. It only runs `npm run start -- -p 3001` after basic local checks.

## Required local expectations

- Node.js and npm are available.
- Production build exists under `.next/`; if missing, run `npm run build` first.
- PostgreSQL is available, normally through Docker for the current setup.
- `cloudflared` is installed and the tunnel service/process is managed outside this repo.
- Port `3001` is the local origin for Cloudflare Tunnel.
- `APP_URL` and `NEXT_PUBLIC_APP_URL` point to `https://staging.fengzlab.tech` for staging.
- `AUTH_SECRET`, `SESSION_SECRET`, and `TOKEN_SECRET` are stable and never committed.
- `PRIVATE_STORAGE_ROOT` points outside public assets.

## Readiness checklist

- [ ] Node/npm available.
- [ ] PostgreSQL/Docker expected status reviewed.
- [ ] `cloudflared` service or process status reviewed.
- [ ] Port `3001` availability reviewed before starting the app.
- [ ] `/api/health` checked after the app is running.
- [ ] Disk free space checked.
- [ ] Backup folder exists.
- [ ] Last PostgreSQL backup timestamp reviewed.
- [ ] Last private storage backup timestamp reviewed.
- [ ] Windows sleep is disabled during service hours.
- [ ] Windows updates/restarts are controlled during service hours.
- [ ] UPS or power backup is planned for the workstation and networking gear.
- [ ] Backups are copied outside the workstation.

## Operating notes

Do not expose local ports directly to the internet. Cloudflare Tunnel should be the public ingress.

Do not use this workstation for final production with real customers until restore drills, monitoring/alerts, external backups, and staging smoke checks are complete.

Do not store secrets in docs, scripts, screenshots, Git, or pasted logs.

## Known home-hosting risks

- Windows sleep or unexpected restart can take the workshop app offline.
- Local disk failure can destroy DB and private files if backups are not copied elsewhere.
- Power or ISP outage can interrupt customer portal access.
- Cloudflare Tunnel protects ingress, but app auth and local machine security remain required.
- Local-only monitoring may miss failures unless alerts are configured separately.
