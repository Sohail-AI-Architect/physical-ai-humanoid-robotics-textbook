<!--
SYNC IMPACT REPORT
==================
Version change: (template/unversioned) → 1.0.0
Bump rationale: MAJOR – initial ratification from blank template; all placeholders replaced.

Modified principles:
  [PRINCIPLE_1_NAME] → I. Spec-Driven Development
  [PRINCIPLE_2_NAME] → II. Content Quality & Accuracy
  [PRINCIPLE_3_NAME] → III. AI-Native Architecture
  [PRINCIPLE_4_NAME] → IV. Security & Secrets Management
  [PRINCIPLE_5_NAME] → V. Accessibility & Internationalization
  [PRINCIPLE_6_NAME] → VI. Observability & Deployment Readiness
  [SECTION_2_NAME]   → Tech Stack & Constraints
  [SECTION_3_NAME]   → Development Workflow

Added sections:
  - Tech Stack & Constraints (derived from master spec)
  - Development Workflow

Removed sections: None

Templates requiring updates:
  ✅ .specify/memory/constitution.md – fully updated
  ⚠  .specify/templates/plan-template.md – Constitution Check section references generic gates;
     update when first feature plan is generated to reference these principles by name.
  ⚠  .specify/templates/spec-template.md – no blocking issues; FR examples are generic.
  ⚠  .specify/templates/tasks-template.md – no blocking issues; task phases are generic.

Deferred TODOs:
  - TODO(RATIFICATION_DATE): Exact adoption date unknown; set to project start estimate 2026-02-26.
-->

# Physical AI & Humanoid Robotics – AI-Native Textbook & Learning Platform Constitution

## Core Principles

### I. Spec-Driven Development

Every feature MUST begin with a written specification (`spec.md`) before any code is written.
Implementation MUST NOT outpace the spec. All tasks in `tasks.md` MUST trace back to a
user story in `spec.md`. Prompt History Records (PHRs) MUST be created for every significant
user prompt. ADR suggestions MUST be surfaced for architecturally significant decisions and
MUST NOT be auto-created without user consent.

**Rationale**: Prevents scope creep, ensures traceability from requirement to code, and keeps
the AI-assisted workflow auditable and reproducible.

### II. Content Quality & Accuracy

All book chapters MUST be technically accurate, university-level, and cover the full 13-week
outline defined in the master spec. Code examples MUST be runnable and version-pinned (ROS 2
Humble, Python 3.10+, NVIDIA Isaac Sim 4.x). Each chapter MUST include learning objectives,
practical exercises, and assessment questions. Content MUST be mobile-responsive when rendered
in Docusaurus v3.

**Rationale**: The primary deliverable is an educational textbook; factual and pedagogical
quality is non-negotiable for academic credibility.

### III. AI-Native Architecture

The RAG chatbot MUST be embedded on every page and MUST support both Global RAG mode and
Selected Text Only mode with citations linking to source chapters. Personalization (gpt-4o-mini)
and Urdu translation features MUST be gated behind authenticated sessions. Claude Code subagents
(ChapterWriterAgent, ROS2CodeGeneratorAgent, HardwareSpecAgent, URDFVisualizerAgent,
RAGConfigAgent) MUST be defined in `spec-kit/subagents/` and MUST be used during content
generation—not created and abandoned. Embeddings MUST use `text-embedding-3-large`.

**Rationale**: AI features are first-class requirements, not add-ons; they MUST be
architecturally integrated and reusable.

### IV. Security & Secrets Management

Secrets (API keys, DB connection strings, auth secrets) MUST be stored in `.env.local` or
environment variables and MUST NOT be committed to the repository. The `.gitignore` MUST
exclude all `.env*` files. Better-Auth session tokens MUST be validated server-side on every
protected route. SQL queries against Neon Postgres MUST use parameterized statements to
prevent injection.

**Rationale**: A public educational platform with auth and LLM API keys is a high-value
attack surface; secrets hygiene and injection prevention are non-negotiable.

### V. Accessibility & Internationalization

The Urdu translation feature MUST preserve all Markdown formatting and technical terms (ROS 2,
URDF, SLAM, etc.) untranslated. The UI MUST support toggling between English and Urdu without
a page reload. Docusaurus components MUST meet WCAG 2.1 AA contrast requirements. The platform
MUST be functional on mobile viewports (≥320px wide).

**Rationale**: The platform targets diverse hardware backgrounds and potentially non-English
speakers; accessibility and i18n are core acceptance criteria.

### VI. Observability & Deployment Readiness

The FastAPI backend MUST expose a `/health` endpoint. All API errors MUST be logged with
request context (route, status code, sanitized payload). Frontend deployments MUST succeed on
Vercel without manual intervention. Backend deployments MUST target Render or Railway with
environment variables configured via the platform's secret store—never baked into Docker images.
A 90-second demo video MUST be produced before final submission.

**Rationale**: Judges evaluate a live deployment; observability and clean CI/CD are required
to demonstrate production readiness.

## Tech Stack & Constraints

| Layer | Technology | Version / Notes |
|---|---|---|
| Frontend / Book | Docusaurus v3 + TypeScript + Tailwind | Node 20+ |
| Chatbot | Custom ChatKit component + OpenAI Agents SDK | — |
| Backend | FastAPI + Uvicorn | Python 3.10+ |
| Vector DB | Qdrant Cloud | Free tier |
| Database | Neon Serverless Postgres | — |
| Auth | better-auth.com | Full signup/signin + session |
| LLM | gpt-4o-mini | Personalization & Urdu translation |
| Embedding | text-embedding-3-large | OpenAI |
| Deployment | Vercel (frontend) + Render / Railway (backend) | — |
| Subagents | Claude Code Subagents | Defined in `spec-kit/subagents/` |

**Out of scope**: Native mobile apps, self-hosted LLM inference, multi-tenancy beyond single
course cohort, video hosting.

**External dependencies**: OpenAI API, Qdrant Cloud, Neon Postgres, Vercel, Render/Railway,
better-auth.com service.

## Development Workflow

1. **Spec first**: Run `/sp.specify` to create or update `specs/<feature>/spec.md`.
2. **Clarify**: Run `/sp.clarify` to resolve ambiguities before planning.
3. **Plan**: Run `/sp.plan` to produce `plan.md`, `research.md`, and `data-model.md`.
4. **Tasks**: Run `/sp.tasks` to generate `tasks.md` with dependency-ordered, testable tasks.
5. **Implement**: Run `/sp.implement` to execute tasks; keep diffs minimal and focused.
6. **Commit & PR**: Run `/sp.git.commit_pr` for structured commits and pull requests.
7. **PHR**: Every user prompt MUST produce a PHR in `history/prompts/` (auto-created by agent).
8. **ADR**: Architecturally significant decisions MUST be documented via `/sp.adr` after
   user consent.

All PRs MUST verify compliance with Principles I–VI before merge. Complexity MUST be justified
in the Complexity Tracking section of `plan.md` when Constitution gates are violated.

## Governance

This constitution supersedes all other project practices and conventions. Amendments require:
1. A written rationale describing what changes and why.
2. A version bump following semantic versioning (MAJOR / MINOR / PATCH rules above).
3. A `LAST_AMENDED_DATE` update (ISO 8601).
4. Propagation checks across all dependent templates (plan, spec, tasks).

Compliance MUST be reviewed on every PR. Use `CLAUDE.md` for runtime agent guidance that
complements but does not override this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-02-26 | **Last Amended**: 2026-02-26
