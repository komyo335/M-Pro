---
marp: true
paginate: true
size: 16:9
title: M-Pro Cafe POS
---
<style> 
  :root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --code-bg: #f4f3ec;
  --accent: #aa3bff;
  --accent-bg: rgba(170, 59, 255, 0.1);
  --accent-border: rgba(170, 59, 255, 0.5);
  --social-bg: rgba(244, 243, 236, 0.5);
  --shadow:
    rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;
  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  --heading: system-ui, 'Segoe UI', Roboto, sans-serif;
  --mono: ui-monospace, Consolas, monospace;
  font: 18px/145% var(--sans);
  letter-spacing: 0.18px;
  color-scheme: light dark;
  color: var(--text);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @media (max-width: 1024px) {
    font-size: 16px;
  }
}
@media (prefers-color-scheme: dark) {
  :root {
    --text: #9ca3af;
    --text-h: #f3f4f6;
    --bg: #16171d;
    --border: #2e303a;
    --code-bg: #1f2028;
    --accent: #c084fc;
    --accent-bg: rgba(192, 132, 252, 0.15);
    --accent-border: rgba(192, 132, 252, 0.5);
    --social-bg: rgba(47, 48, 58, 0.5);
    --shadow:
      rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
  }
  #social .button-icon {
    filter: invert(1) brightness(2);
  }
}
/* ── User-controlled theme (overrides system preference) ─── */
[data-theme="dark"] {
  --text: #9ca3af;
  --text-h: #f3f4f6;
  --bg: #16171d;
  --border: #2e303a;
  --code-bg: #1f2028;
  --accent: #c084fc;
  --accent-bg: rgba(192, 132, 252, 0.15);
  --accent-border: rgba(192, 132, 252, 0.5);
  --social-bg: rgba(47, 48, 58, 0.5);
  --shadow:
    rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
}
[data-theme="light"] {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --code-bg: #f4f3ec;
  --accent: #aa3bff;
  --accent-bg: rgba(170, 59, 255, 0.1);
  --accent-border: rgba(170, 59, 255, 0.5);
  --social-bg: rgba(244, 243, 236, 0.5);
  --shadow:
    rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;
}
/* ── User-controlled font size ─────────────────────────── */
[data-font-size="small"] {
  font-size: 15px;
}
[data-font-size="medium"] {
  font-size: 18px;
}
[data-font-size="large"] {
  font-size: 21px;
}
#root {
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  border-inline: 1px solid var(--border);
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
body {
  margin: 0;
}
h1,
h2 {
  font-family: var(--heading);
  font-weight: 500;
  color: var(--text-h);
}
h1 {
  font-size: 56px;
  letter-spacing: -1.68px;
  margin: 32px 0;
  @media (max-width: 1024px) {
    font-size: 36px;
    margin: 20px 0;
  }
}
h2 {
  font-size: 24px;
  line-height: 118%;
  letter-spacing: -0.24px;
  margin: 0 0 8px;
  @media (max-width: 1024px) {
    font-size: 20px;
  }
}
p {
  margin: 0;
}
code,
.counter {
  font-family: var(--mono);
  display: inline-flex;
  border-radius: 4px;
  color: var(--text-h);
}
code {
  font-size: 15px;
  line-height: 135%;
  padding: 4px 8px;
  background: var(--code-bg);
}
</style>

<!-- _class: lead -->
<!-- _paginate: false -->


# Tech Stack

### M-Pro Cafe POS 

### How it's built — stack, agents, skills, methodology

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Language** | TypeScript, Javascript |
| **Testing** | Vitest |
| **Deployment** | Vercel |

---

## AI Agents

| Agent | Model | Purpose |
|---|---|---|
| **mcp-data-implementer** | sonnet |Implement the data for the project need |
-  lives at `.claude/agents/mcp-data-implementer.md`
-  Automatically implement the data throungh MCP server
---

## Skills

| Skill | Purpose |
|---|---|
| **M-Pro** |Make record and  data structure of the Project |

- Lives at `.claude/skills/M-Pro/SKILL.md`
- **Trigger:** Generate, refine, or get inspiration for UI components via 21st.dev
- **Command:** `/21st` or invoked automatically during feature work
- **Steps:** Name behavior →Generate UI → Implement → Run full suite

---

## Methodology
** Steps by Steps, One Feature to Another Feature **

```
Plan → Execute → Verify → Ship
```

- Break work into small, shippable phases
- Each phase = one commit, one working feature
- Verify before moving on — no accumulating bugs
- Ship to Vercel after every phase — always deployable


---

## MCP Tools

| MCP Server | What it does |
|---|---|
| **Context7** |addressing the issue of LLMs relying on outdated information |
| **Magic**  | Generates and refines UI components |
|**Context-awesome** | Accessing  to a wealth of high-quality, community-curated resources |

- Configured in `.mcp.json`
- Used throughout development to avoid outdated API assumptions

---

## Trigger & Commands

| What | Trigger | Command |
|---|---|---|
| **/21st** |Generate, refine, or get inspiration for UI components via 21st.dev | `/21st'` |
| **Context7 MCP** | Need docs for a library | Auto-resolved |

---

<!-- _class: dark -->

# The Result

**A working app in days, not months.**

- steps by steps from zero to deployed
- 2 agents with clear responsibilities
- Always shippable, always deployable

**Live: ** https://m-pro-git-main-myo335074-6768s-projects.vercel.app
