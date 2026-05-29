# RepairLab Agent Roster

This directory defines specialized local agents for evolving RepairLab safely.

All agents must follow `agents/repairlab-agent-rules.md`.

## Mission Hierarchy

Primary mission:

RepairLab exists to run the user's own electronics/repair workshop better.

Secondary mission:

RepairLab supports marketing, content generation, customer communication, and customer acquisition for the workshop.

Future optional mission:

RepairLab may become a commercial SaaS product only after it proves useful in daily internal workshop operations.

## Roster

| Agent | File | Use When |
| --- | --- | --- |
| Workshop CEO Agent | `agents/ceo-agent.md` | You need profitability, service prioritization, investment decisions, or focus discipline. |
| Workshop Operations Agent | `agents/product-manager-agent.md` | You need to improve intake, diagnosis, quote, repair, invoice, payment, delivery, or warranty workflows. |
| Inventory Agent | `agents/inventory-agent.md` | You need stock control, spare parts planning, low-stock logic, supplier notes, or inventory cost decisions. |
| Frontend Developer Agent | `agents/frontend-developer-agent.md` | You need fast workshop UI, mobile-first screens, React, Next.js, Tailwind, shadcn/ui, or accessibility implementation. |
| Backend Architect Agent | `agents/backend-architect-agent.md` | You need reliability, data integrity, storage, backups, audit, security, or future scaling planning. |
| UI/UX Designer Agent | `agents/ui-ux-designer-agent.md` | You need professional workshop UX, customer trust, mobile usability, PDFs, portal, or visual consistency. |
| Design Brand Guardian Agent | `agents/design-brand-guardian.md` | You need brand consistency, product voice, identity protection, or cross-touchpoint review. |
| Local Marketing Agent | `agents/growth-hacker-agent.md` | You need local SEO, Google Business ideas, campaign planning, or repair service promotion. |
| Content Agent | `agents/content-agent.md` | You need repair-ticket-based post drafts, captions, educational content, blog ideas, or short video scripts. |
| Customer Relations Agent | `agents/sales-agent.md` | You need customer messages, quote explanations, pickup reminders, warranty responses, or objection handling. |
| Reality Checker Agent | `agents/reality-checker-agent.md` | You need to challenge overengineering, SaaS creep, or low-value automation. |
| QA Agent | `agents/qa-agent.md` | You need manual E2E validation, mobile testing, PDF testing, regression checks, or release readiness. |
| Security Agent | `agents/security-agent.md` | You need admin security, portal token safety, private file access, backups, or sensitive data review. |

## Recommended Workflows

Operational features:

```txt
Workshop Operations -> Frontend Developer / Backend Architect -> QA -> Reality Checker
```

Inventory features:

```txt
Inventory Agent -> Backend Architect -> Frontend Developer -> QA
```

Marketing and content features:

```txt
Local Marketing Agent -> Content Agent -> UI/UX Designer -> Reality Checker
```

Strategic decisions:

```txt
Workshop CEO -> Reality Checker
```

Security-sensitive changes:

```txt
Security Agent -> Backend Architect -> QA
```

## Installed Skill

The `ui-ux-pro-max` skill is required for the Frontend Developer Agent and UI/UX Designer Agent.

Installed location:

```txt
~/.codex/skills/ui-ux-pro-max
```

Restart Codex after installing new skills so the runtime can discover them.

## External Agent Reference

The requested `msitarzewski/agency-agents` reference is treated as an inspiration for an agency-style roster. These local files are RepairLab-specific and must remain aligned with the user's workshop-first strategy, actual stack, docs, and constraints.
