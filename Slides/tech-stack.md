---
marp: true
paginate: true
transition: fade
size: 16:9
title: Learn Programming Easily — Tech Stack
style: |
  :root {
    --paper: #FAF5EA;
    --paper-2: #F3ECDC;
    --ink: #2B2622;
    --ink-soft: #5C5247;
    --brick: #B0432B;
    --line: #E2D7C2;
  }
  section {
    background: var(--paper);
    color: var(--ink);
    font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 26px;
    line-height: 1.5;
    padding: 64px 72px;
  }
  h1, h2, h3 {
    font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
    color: var(--ink);
    letter-spacing: -0.01em;
  }
  h1 { font-size: 60px; line-height: 1.05; margin: 0 0 .2em; }
  h2 { font-size: 40px; margin: 0 0 .5em; }
  h2::after {
    content: ""; display: block; width: 64px; height: 4px;
    background: var(--brick); margin-top: 14px; border-radius: 2px;
  }
  strong { color: var(--brick); }
  a { color: var(--brick); text-decoration: none; }
  table { font-size: 22px; border-collapse: collapse; }
  th { background: var(--paper-2); text-align: left; }
  th, td { border: 1px solid var(--line); padding: 8px 14px; }
  code {
    background: var(--paper-2); color: var(--brick);
    padding: 1px 7px; border-radius: 5px; font-size: 0.85em;
  }
  ul { margin-top: .2em; }
  li { margin: .25em 0; }
  section.dark { background: #211D1A; color: #F3ECDC; }
  section.dark h1, section.dark h2, section.dark h3 { color: #F3ECDC; }
  section.dark strong { color: #E0795F; }
  section.dark a { color: #E0795F; }
  footer, header { color: var(--ink-soft); }
  section::after { color: var(--ink-soft); }
---

<!-- _class: lead -->
<!-- _paginate: false -->

<span class="tag">Tech Stack</span>

# Learn Programming Easily

### How it's built — stack, agents, skills, methodology

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, SSG) |
| **UI** | React 19, Tailwind CSS v4 |
| **Language** | TypeScript |
| **Database** | PostgreSQL + Prisma 7 |
| **Auth** | Auth.js v5 (credentials, bcrypt + JWT) |
| **Content** | Data stored in Db as markdown|
| **Search** | Fuse.js (client-side, Cmd+K) |
| **Syntax Highlighting** | Shiki (light + dark themes) |
| **Testing** | Vitest |
| **Deployment** | Vercel |

---

## AI Agents

| Agent | Model | Purpose |
|---|---|---|
| **test-runner** | Haiku | Runs Vitest suite, returns terse pass/fail summary |
| **Claude Code** | Opus | Main coding agent — implements features from spec |

- `test-runner` lives at `.claude/agents/test-runner.md`
- Fires automatically when tests need to be verified
- Keeps main-thread context free by delegating test output

---

## Skills

| Skill | Purpose |
|---|---|
| **test-feature** | TDD discipline — every feature with logic gets a Vitest test before "done" |

- Lives at `.claude/skills/test-feature/SKILL.md`
- **Trigger:** When implementing or changing any feature with testable logic
- **Command:** `/test-feature` or invoked automatically during feature work
- **Steps:** Name behavior → Write test (red) → Implement → Run full suite (green)

---

## Methodology

**Superpowers — Spec Driven Development (SDD)**

1. **Spec first** — Full architecture, DB schema, tech stack, and phased plan defined in `CLAUDE.md` and memory files before any code
2. **Phased execution** — Each phase produces a working vertical slice (schema → rendering → admin → polish)
3. **Traceable commits** — Every commit maps back to a documented requirement in the spec
4. **No drift** — The spec is the single source of truth; implementation stays aligned with design intent

> Architecture before code. Requirements before implementation.

---

## MCP Tools

| MCP Server | What it does |
|---|---|
| **Context7** (`@upstash/context7-mcp`) | Fetches live, up-to-date library docs (Next.js, Prisma, Auth.js, Tailwind) during implementation |
| **21st.dev Magic** (`@21st-dev/magic`) | Generates and refines UI components from the 21st.dev component library |

- Configured in `.mcp.json`
- Used throughout development to avoid outdated API assumptions

---

## Trigger & Commands

| What | Trigger | Command |
|---|---|---|
| **test-feature skill** | Feature with logic is being implemented | `/test-feature` |
| **test-runner agent** | Need to verify tests quickly | "Run the tests" |
| **Context7 MCP** | Need docs for a library | Auto-resolved by Claude Code |
| **21st.dev MCP** | Need a UI component | Auto-resolved by Claude Code |

---

<!-- _class: dark -->

## Summary

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind v4 · PostgreSQL · Prisma 7 · Auth.js v5 · Shiki · Fuse.js

**AI Workflow:** Spec Driven Development → Context7 docs → 21st.dev components → test-feature TDD → test-runner verification

**Result:** A fast, beautiful, self-hosted programming blog CMS.

**Live:** `https://articles.htunaungkyaw.online`
