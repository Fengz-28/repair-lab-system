# Domain and VPS Purchase Checklist

Status: purchase planning only. No domain, VPS, DNS, email provider, or production service has been purchased or configured.

## Purpose

Use this checklist before spending money on the domain and VPS for FengzLab / RepairLab.

The goal is to buy only what is needed for a controlled staging deployment first. Do not treat the first purchase as a final production launch.

## Domain selection checklist

Before buying a domain:

- [ ] Brand name is final enough for public use.
- [ ] Domain is easy to spell verbally.
- [ ] Domain is short enough for receipts, WhatsApp messages, and customer instructions.
- [ ] Domain does not conflict with another local business name.
- [ ] Domain can support a staging subdomain, for example `staging.<domain>`.
- [ ] Registrar supports DNS management or allows external nameservers.
- [ ] Registrar supports auto-renewal.
- [ ] Registrar account is protected with strong password and MFA if available.
- [ ] Renewal price is acceptable, not only first-year promo price.
- [ ] Domain owner/contact information is controlled by the workshop owner.

Avoid domains that:

- are hard to pronounce;
- depend on hyphens or unusual spelling;
- look like a SaaS product instead of a repair workshop;
- are cheap only for the first year but expensive to renew;
- force bundled hosting that is not needed.

## VPS provider checklist

Before choosing a VPS provider:

- [ ] Provider supports the target Linux OS.
- [ ] Provider offers SSD storage.
- [ ] Provider has a region close enough to Costa Rica or the main customer base.
- [ ] Provider allows inbound ports `80` and `443`.
- [ ] Provider has a basic firewall or network security controls.
- [ ] Provider has console access or rescue mode.
- [ ] Provider supports snapshots or backups, even if not used as the only backup.
- [ ] Provider billing is predictable monthly.
- [ ] Provider makes it easy to resize later.
- [ ] Provider terms allow normal business web apps.

Avoid for the first deploy:

- Kubernetes platforms;
- multi-node clusters;
- serverless rewrites;
- managed databases that require changing the deployment plan immediately;
- very small free tiers that can run out of memory or disk during builds/backups.

## Minimum VPS specs

Minimum recommended staging VPS:

```txt
2 vCPU
4 GB RAM
60 GB SSD
Ubuntu LTS
Docker + Docker Compose plugin
```

Recommended if budget allows:

```txt
2-4 vCPU
4-8 GB RAM
80+ GB SSD
provider snapshots
basic firewall controls
```

Do not overspend before staging proves the deploy path and real usage pattern.

## Backup and storage considerations

The VPS must have enough disk for:

- PostgreSQL data;
- private upload files;
- local backup artifacts;
- Docker images and build cache;
- temporary restore drill targets.

Before real customer data:

- [ ] Confirm local DB backup works.
- [ ] Confirm private storage backup works.
- [ ] Choose where offsite encrypted backups will live.
- [ ] Define retention policy.
- [ ] Complete a restore drill against temporary targets.

Provider snapshots are useful, but they are not a replacement for database and private storage backups.

## Region and location considerations

Choose a region based on:

- latency for Costa Rica users;
- provider reliability;
- price;
- support quality;
- data location comfort;
- backup/restore speed.

For the first staging deploy, choose a nearby stable region rather than optimizing globally. The app is workshop-first and single-region is enough.

## DNS plan

Initial DNS records:

```txt
A     <domain>              <VPS IPv4>
A     staging.<domain>      <VPS IPv4>
CNAME www.<domain>          <domain>
```

Optional later:

```txt
MX    <domain>              <email provider value>
TXT   <domain>              SPF/DKIM/DMARC values
```

Do not point public production DNS to the app until:

- staging deploy works;
- HTTPS works;
- healthcheck works;
- backup and restore drill are understood;
- manual QA passes.

## Email and DNS caveat

If SMTP or a transactional email provider is added later, DNS may need:

- MX records;
- SPF TXT record;
- DKIM TXT/CNAME records;
- DMARC TXT record;
- provider verification records.

Do not buy or configure email services just because the domain is purchased. Email should be added only when customer communication flow is ready, secrets are managed, and rollback is understood.

## Secrets to generate after purchase

After domain/VPS purchase, generate or define:

- `AUTH_SECRET`
- `POSTGRES_PASSWORD`
- production/staging `DATABASE_URL`
- admin seed password for staging
- `APP_URL`
- `PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_URL`
- `ADMIN_ALLOWED_ORIGINS`
- `CORS_ALLOWED_ORIGINS`
- backup encryption secret, if external encrypted backups are configured

Rules:

- do not commit `.env.production`;
- do not paste real secrets into docs or prompts;
- do not reuse local demo credentials;
- use different secrets for staging and production if both exist;
- store secrets in a password manager or another controlled secret store.

## What not to buy yet

Do not buy or enable these for the first staging deploy unless there is a specific approved need:

- Kubernetes cluster;
- multi-server load balancer;
- managed Redis solely for scale;
- managed object storage migration;
- paid APM suite;
- SMS provider;
- WhatsApp Business API;
- SMTP provider;
- paid AI provider;
- managed vector database;
- separate analytics platform;
- SaaS billing/subscription tooling.

The first goal is proving the workshop app can run safely and reliably for FengzLab.

## First-month staging plan

Week 1:

- buy domain only if the branding decision is ready;
- buy VPS only after validation passes;
- deploy staging;
- configure HTTPS;
- confirm `/api/health`;
- create staging admin;
- run manual QA flow.

Week 2:

- run DB and storage backups;
- run safe restore drill into temporary targets;
- configure basic uptime monitoring;
- review logs and disk usage;
- fix only deployment blockers.

Week 3:

- test customer portal links;
- test PDF routes;
- test private upload/download;
- review backup freshness;
- document any operator steps that were confusing.

Week 4:

- decide whether staging is stable enough for limited real workshop use;
- update `docs/production/launch-checklist.md` with GO / NO-GO status;
- defer non-essential integrations until core operations are stable.

## Final recommendation

Buy domain and VPS only when:

- `npm run build` passes;
- `npm run lint` passes;
- `npx tsc --noEmit` passes;
- `npm run test` passes;
- `docker compose -f docker-compose.production.yml config --quiet` passes;
- repo is clean enough that deployment changes are reviewable;
- staging preflight is understood;
- restore drill plan is understood;
- no real secrets need to be committed.

First deployment should be:

```txt
staging only
```

Final production with real customer data should wait until:

- staging deploy succeeds;
- HTTPS is active;
- backups work;
- restore drill succeeds;
- monitoring is active;
- manual workshop QA passes;
- launch checklist says GO or GO with accepted conditions.
