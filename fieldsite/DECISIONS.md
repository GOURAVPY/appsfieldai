# Fieldsite — Engineering Decisions

This file records decisions made autonomously during the build, per the build brief's
"make sensible decisions and document them" rule.

## D0 — Location: subfolder, not repo root
The build brief said "scaffold a monorepo at the repo root." The repo root already
contains a live, unrelated product (**AppsfieldAI**, a Base44 marketplace app with a
`custom-domain-service`, ~45 entities and ~60 functions). Scaffolding at the root would
overwrite working code. Decision: Fieldsite lives entirely under `fieldsite/`. Nothing
outside `fieldsite/` is modified. This is fully reversible.

## D1 — Package manager & workspaces
npm workspaces (already the toolchain in the parent repo). Root `package.json` declares
`shared`, `backend`, `workers`, `frontend` as workspaces. `concurrently` runs them in dev.

## D2 — TypeScript everywhere except frontend build
All packages are strict TypeScript. `tsconfig.base.json` sets `strict: true`,
`noUncheckedIndexedAccess`, and bans implicit `any`. Frontend uses Vite + `tsc` typecheck.

## D3 — Shared package is the schema source of truth
`shared` exports the Zod schemas (`SitePlan`, `Section`, `EffectId`, `AssetBrief`) and their
inferred TS types. Backend, workers and frontend all import from `@fieldsite/shared`. The
`SitePlan` is the single source of truth; edits are RFC-6902 JSON Patches applied to it.

## D4 — Model IDs
Per brief: `claude-sonnet-4-6` (plan/codegen), `claude-haiku-4-5` (intent/copy). These are
pinned in `backend/src/services/llm.ts` and overridable via env. (Note: if these IDs are not
yet GA at deploy time, override with `LLM_PLAN_MODEL` / `LLM_FAST_MODEL` env vars.)

## D5 — MOCK_PROVIDERS
When `MOCK_PROVIDERS=true`, Fal/Kling/Pexels calls return deterministic placeholder URLs
instantly and the LLM plan/edit steps can return canned fixtures, so the full pipeline is
testable with zero API spend. This gates every external provider call behind one flag.

## D6 — Effects are a closed set
The LLM only *selects and parameterizes* the 14 `EffectId`s. The Composer maps each section
to a hand-built template module. Generated HTML is never string-edited; edits re-compose.

## D7 — Asset fan-in
`generate-plan` writes a Redis counter `plan:{projectId}:pending = assets.length`. Each
finished `asset` job decrements it; the worker that hits 0 enqueues `compose`. This avoids
relying on BullMQ flow producers for the first cut.
