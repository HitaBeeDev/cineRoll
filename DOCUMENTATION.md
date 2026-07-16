# CineRoll — Documentation Guide

This is the entry point to all CineRoll documentation. It tells you what exists, who each document is for, and in what order to read — so you never have to guess where an answer lives.

**What CineRoll is, in one paragraph.** A film-discovery app for award-winning cinema: browse, filter, and search ~8,600 films carrying their complete award history across the Oscars, Golden Globes, Cannes, the Berlinale, and the IMDB Top 250 — or "roll" a random film from any filtered set, with a personalized recommendation layer learned from your taste. The genuinely hard engineering is in two places: the **award-data pipeline** (entity resolution across five award bodies and a century of ceremonies) and the **algorithm layer** (content-based recommendations, taste modelling, bandit-driven rolls). Everything else is deliberately boring and solid.

---

## Start here, by reader

| You are… | Read this first | Then |
|---|---|---|
| **A reviewer / hiring manager** with 10 minutes | [`CASE_STUDY.md`](./docs/CASE_STUDY.md) — the engineering story, hardest problem first | [`algorithms.md`](./docs/algorithms.md) for the full algorithm catalog |
| **A developer** joining or evaluating the codebase | [`SETUP.md`](./docs/SETUP.md) — clone to running app | [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md), then [`API_DOCS.md`](./docs/API_DOCS.md) |
| **The operator** running a data build | [`DATA-WORKFLOW.md`](./docs/DATA-WORKFLOW.md) — the pipeline runbook | [`CHECKLIST.md`](./docs/CHECKLIST.md) for current position |
| **Deploying** to production | [`DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | [`DECISIONS.md`](./docs/DECISIONS.md) §load-check for sizing context |

---

## The documents

### Product documentation — what the system is and how it works

| Document | What it covers | Audience |
|---|---|---|
| [`CASE_STUDY.md`](./docs/CASE_STUDY.md) | The portfolio writeup: the entity-resolution problem, the TMDB-ID pivot that solves it, the recommender built on top. Leads with the hardest engineering. | Reviewers, anyone new |
| [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | How the system is put together and why: build-time pipeline vs run-time services, frontend↔backend↔DB topology, the JWT bridge, event flow. | Developers |
| [`API_DOCS.md`](./docs/API_DOCS.md) | Every endpoint of the Express backend — auth conventions, one error shape, the shared filter set, request/response examples. | Developers, API consumers |
| [`algorithms.md`](./docs/algorithms.md) | The catalog of every named algorithm in the product (FNV-1a seeding, BM25, TF-IDF + cosine, MMR, Thompson sampling, IRT/Rasch, …) — what problem each solves, where it lives, and an honest shipped/designed status. Appendix A is the Smart Roll deep-dive. | Reviewers, developers |
| [`RECOMMENDATIONS.md`](./docs/RECOMMENDATIONS.md) | The recommender end to end: signal weights, taste profile with 90-day decay, candidate scoring, MMR diversity re-rank, explainable reasons, A/B measurement. | Reviewers, developers |
| [`DECISIONS.md`](./docs/DECISIONS.md) | Engineering decision log — what was chosen, why, and what it cost (monorepo, Express vs Next API routes, Postgres vs Mongo, pg_trgm vs Algolia). Measured indexing and load-check findings at the bottom. | Developers, reviewers |

### Process documentation — how the project is built and operated

| Document | What it covers | Audience |
|---|---|---|
| [`SETUP.md`](./docs/SETUP.md) | Local development from clone to running app: prerequisites, env vars (validated at boot), the `{ ok: true, db: "up" }` sanity check. | Developers |
| [`DATA-WORKFLOW.md`](./docs/DATA-WORKFLOW.md) | The operator runbook for the Excel → `master.json` → PostgreSQL pipeline: the per-award-year workflow, the recall queue for unresolved films, the hard rules that keep the dataset trustworthy. | Operator |
| [`DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Production topology (one Vercel project runs both apps, Neon runs Postgres), the rewrite that keeps route code identical in dev and prod, env vars, launch steps. | Operator, developers |
| [`CHECKLIST.md`](./docs/CHECKLIST.md) | The living build plan: completed work first, remaining work in execution order, ★ marking the core engineering items. | Owner, reviewers tracking scope |

---

## How the codebase itself is documented

- **Types are the contract.** The API shape lives in `packages/types` (`@cineroll/types`) and compiles into both apps — change the `Film` interface and both sides break at build time, not in production. The types are the first documentation a developer should trust.
- **Config self-documents.** `backend/src/config.ts` validates every environment variable at boot and refuses to start on a bad value; the env tables in `SETUP.md` and `DEPLOYMENT.md` mirror it.
- **Tests tell the story.** The algorithm layer (recommender, bandit, taste profile) ships with Vitest unit tests plus a separate integration suite (`npm run test:integration`) against a real Postgres — read them as executable examples of intended behavior.
- **Errors are uniform.** Every backend error is `{ "error": "…", "code": "…" }` with a stable code; the full table is in `API_DOCS.md`. There is exactly one error shape to learn.

## Conventions these docs follow

1. **Plain language, short sentences.** No jargon where a normal word works. A doc that produces questions has failed.
2. **Detail lives in one deep doc and is linked, never re-explained.** The signal-weight table exists once, in `RECOMMENDATIONS.md`; everything else points there. If two docs disagree, the deep doc wins — fix the shallow one.
3. **Honest status.** `algorithms.md` marks every entry ✅ shipped or 🔶 designed. Nothing is presented as built that isn't.
4. **Decisions record their cost.** Every entry in `DECISIONS.md` states what the choice gave up, not just why it won.
5. **Docs change with the code.** A PR that changes an endpoint, an env var, or an algorithm updates the matching doc in the same commit — Conventional Commits (`docs:`) make those changes visible in history.

## Keeping this guide current

When a document is added, renamed, or retired, update the tables above in the same commit. This file stays a map — content belongs in the documents it points to.
