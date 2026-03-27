# Organizze MCP - Agent Team

A multi-agent workflow for improving the Organizze MCP server. Each agent brings a distinct perspective to ensure the MCP is complete, correct, useful, and AI-friendly.

## Team Roles

| Agent | File | Purpose |
|-------|------|---------|
| Developer | `developer.md` | Implements API endpoints as MCP tools |
| Challenger | `challenger.md` | Questions every design decision |
| QA | `qa.md` | Tests tools and validates behavior |
| Finance Expert | `finance-expert.md` | Ensures tools are useful for real personal finance work |
| AI/MCP Expert | `ai-mcp-expert.md` | Ensures tools are AI-friendly and follow MCP best practices |
| Scribe | `scribe.md` | Tracks decisions, open questions, and implementation progress |

## Project Context

**Repo:** `/Users/silvio/Projects/personal/organizze-mcp`
**Tech stack:** TypeScript, Node.js ESM, `@modelcontextprotocol/sdk`, `zod`, `yargs`
**Transport:** stdio
**Auth:** HTTP Basic Auth (email + API token passed as CLI args)

### Current State (v0.1.0)

8 read-only tools implemented:
- `get-bank-accounts` — list or single account
- `get-transactions` — list with optional date/account filter
- `get-transaction` — single transaction by ID
- `get-credit-cards` — list or single card
- `get-credit-cards-invoices` — invoices for a card
- `get-credit-cards-invoice-details` — invoice detail + line items
- `get-budgets` — monthly/annual budget targets
- `get-categories` — list or single category

### Organizze API Reference

Base URL: `https://api.organizze.com.br/rest/v2`

**Endpoints not yet implemented:**
- `GET /users/{id}` — current user info
- `GET|POST|PUT|DELETE /accounts` — account CRUD
- `GET|POST|PUT|DELETE /categories` — category CRUD
- `GET|POST|PUT|DELETE /credit_cards` — credit card CRUD
- `POST|PUT|DELETE /transactions` — transaction write operations
- `GET|POST|PUT|DELETE /transfers` — transfers (entire resource missing)
- `GET /credit_cards/{id}/invoices/{id}/payments` — invoice payments

**Transaction features not exposed yet:**
- Recurring transactions (`monthly_recurring: true`)
- Installment transactions (`installments_count`, `installment_number`)
- `update_future` / `update_all` flags on update/delete

### Codebase Structure

```
src/
  index.ts              # MCP server + tool definitions
  cli.ts                # CLI shebang wrapper
  models/
    organizze.models.ts # TypeScript interfaces
  services/
    organizze.service.ts # HTTP calls to Organizze API
  utils/
    formatters.ts        # Currency, date, markdown table helpers
    response-builders.ts # Formats API responses into MCP content blocks
```

Response format convention: each tool returns 2-3 content blocks — a summary paragraph, a markdown table, and raw JSON.

---

## Suggested Workflow

### Starting a session

Invoke agents in this order for a new feature or improvement sprint:

1. **Finance Expert** — defines what's most valuable to implement next and what questions users want to answer
2. **Developer** — proposes implementation plan for the prioritized features
3. **AI/MCP Expert** — reviews tool names, descriptions, input schemas, and output format
4. **Challenger** — pokes holes in the plan, raises edge cases and scope issues
5. **Developer** — revises plan based on feedback and implements
6. **QA** — validates the implementation against edge cases and the API contract
7. **Scribe** — records decisions and updates this README

### Typical prompts to get started

```
# Kick off a feature planning session:
@finance-expert What are the top 3 most valuable tools we're missing from the Organizze MCP?

# Get an implementation plan:
@developer Based on the finance expert's priorities, propose an implementation plan for the transfers resource.

# Get an AI/MCP review:
@ai-mcp-expert Review the proposed tool names, descriptions, and input schemas for the transfers tools.

# Challenge the plan:
@challenger What could go wrong with the proposed transfers implementation?

# After implementation, QA:
@qa Write a test plan for the new create-transaction tool.
```

---

## Decisions Log

| Date | Decision | Rationale | Made By |
|------|----------|-----------|---------|
| 2026-03-26 | Read-only first (v0.1.0) | Safe default for a personal finance tool; write ops need more careful validation | Developer |
| 2026-03-26 | Three content blocks per tool (summary + table + JSON) | AI gets narrative + structured view + raw data to reason over | AI/MCP Expert |
| 2026-03-26 | CLI args for credentials, not env vars | Allows per-invocation credential injection compatible with Claude Desktop MCP config | Developer |
| 2026-03-26 | v0.2.0 scope: 3 phases (cross-cutting, read tools, first write) | Transfers fix cash flow; .describe() is highest-ROI; phased PRs keep changes reviewable | Finance Expert, AI/MCP Expert, Developer |
| 2026-03-26 | .describe() mandatory on all zod params | AI models need annotations to know formats, defaults, and cross-tool references | AI/MCP Expert |
| 2026-03-26 | Tool descriptions must include when-to-use guidance | Description is the AI's tool selection criterion; one-liners cause confusion | AI/MCP Expert |
| 2026-03-26 | Transfers are critical for data completeness | Without transfers, transfers appear as expenses in spending analysis | Finance Expert |
| 2026-03-26 | Expose recurring/installment fields in get-transactions | Data already in API but hidden; high value for subscription tracking | Finance Expert |
| 2026-03-26 | Drop `confirm` guard, rely on MCP client approval | `confirm: true` is security theater; MCP clients already have tool approval dialogs | Challenger, Developer |
| 2026-03-26 | No pagination helper needed (API is date-bounded) | API uses date ranges, not pages; .describe() recommends monthly queries; JSON cap handles large ranges | Developer |
| 2026-03-26 | Generic CachedLookup utility (5min TTL) | Resolves ID Trap; reusable for categories, accounts, credit cards | Challenger, Developer |
| 2026-03-26 | Date regex validation on all date params | Prevents ambiguous date formats reaching the API | Challenger |
| 2026-03-26 | create-transaction: single one-time only in v0.2.0 | Recurring/installment creation has complex side effects needing more design | Developer, Challenger |
| 2026-03-26 | PR 1 split: 1a (annotations) + 1b (behavior) | Separates zero-risk changes from behavioral changes for easier review | Challenger |
