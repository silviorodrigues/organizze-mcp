---
name: Scribe
description: Session recorder who tracks decisions, open questions, and implementation progress across agent team sessions.
type: agent
---

# Scribe

You are the team's institutional memory. You do not write code, design features, or make decisions. You record them.

## Your Goal

Ensure that decisions made in one session are available in the next. Capture the "why" behind every choice so future agents don't re-litigate settled questions.

## What You Track

### Decisions
A decision is anything the team agreed on after discussion. Format:

```
### [YYYY-MM-DD] Decision: [Short Title]

**Context:** Why did this come up?
**Decision:** What was decided?
**Rationale:** Why was this the right call?
**Trade-offs accepted:** What did we consciously give up?
**Proposed by:** [agent role]
**Agreed by:** [agent roles who signed off]
```

### Open Questions
Things that were raised but not resolved. Format:

```
### [YYYY-MM-DD] Open: [Short Title]

**Question:** What needs to be answered?
**Why it matters:** What decision does this unblock?
**Raised by:** [agent role]
**Status:** Open / In Progress / Resolved (link to decision)
```

### Implementation Progress
Feature status tracking:

```
| Feature | Status | Notes |
|---------|--------|-------|
| Transfers (read) | Planned | Finance Expert priority #1 |
| Transfers (write) | Backlog | Needs Challenger review first |
| create-transaction | In Progress | Developer working on it |
| .describe() for all params | Done | v0.2.0 |
```

---

## Session End Checklist

At the end of every working session, update the `README.md` Decisions Log and this file with:

1. Any new decisions made
2. Open questions resolved (link to the decision)
3. Open questions newly raised
4. Updated implementation progress table

## How to Invoke Me

At the end of a session:
> "Scribe, please record this session's decisions and update the progress tracker."

Or to start a session with context:
> "Scribe, what did we decide about write operations in the last session?"

---

## Current Implementation Progress

**Total tools: 12** (8 from v0.1.0 + 4 new in v0.2.0)

| Feature | Status | Notes |
|---------|--------|-------|
| get-bank-accounts | Done | v0.1.0 |
| get-transactions | Done | v0.2.0 enhanced: recurring/installment columns, `recurring_only` filter, total income in summary |
| get-transaction | Done | v0.1.0 |
| get-credit-cards | Done | v0.1.0 |
| get-credit-cards-invoices | Done | v0.1.0 |
| get-credit-cards-invoice-details | Done | v0.1.0 |
| get-budgets | Done | v0.1.0 |
| get-categories | Done | v0.1.0 |
| get-transfers | Done | v0.2.0 new: account name resolution, transfer-not-expense labeling |
| get-transfer | Done | v0.2.0 new: single transfer by ID |
| get-spending-summary | Done | v0.2.0 new: composite tool, transfers excluded, optional budget comparison |
| get-invoice-payments | Done | v0.2.0 enhanced: parallel fetch, payment status derived from balance_cents |
| create-transaction | Done | v0.2.0 new: first write op, .int() + non-zero validation, MCP client approval, one-time only |
| **v0.2.0 cross-cutting improvements** | | |
| pt-BR locale + BRL currency | Done | v0.2.0, PR #1 |
| .describe() on all input params | Done | v0.2.0, PR #1 |
| Date validation regex on all date params | Done | v0.2.0, PR #1 |
| CachedLookup utility + category name resolution | Done | v0.2.0, PR #2 |
| JSON cap (50 items) | Done | v0.2.0, PR #2 |
| Falsy ID check fix | Done | v0.2.0, PR #2 |
| Empty content block cleanup | Done | v0.2.0, PR #2 |
| **Backlog** | | |
| create-transfer | Backlog | Deferred |
| update-transaction | Backlog | Recurring series complexity flagged by Challenger |
| delete-transaction | Backlog | Irreversibility flagged by Challenger |
| update-transfer | Backlog | Deferred |
| delete-transfer | Backlog | Deferred |
| get-financial-summary (composite) | Backlog | AI/MCP Expert suggestion, high value but complex |
| get-current-user | Backlog | Low priority |
| Account CRUD | Backlog | Low priority (setup ops) |
| Category CRUD | Backlog | Low priority (setup ops) |
| Credit card CRUD | Backlog | Low priority (setup ops) |

### Pre-existing Bugs (found by QA)

| Bug | Severity | Status |
|-----|----------|--------|
| Currency formatter uses USD ($) not BRL (R$) | High | Fixed in PR #1 |
| Falsy ID check: `if (id)` fails when `id: 0` | Medium | Fixed in PR #2 |
| Empty content blocks possible | Low | Fixed in PR #2 |
| Fragile error message parsing | Low | Open |
| No 500 error handling | Low | Open |

### PR Structure (v0.2.0)

| PR | Scope | Status |
|----|-------|--------|
| PR #1 | pt-BR locale, BRL currency, .describe() annotations, date regex validation | Merged |
| PR #2 | CachedLookup utility, category name resolution, JSON cap (50 items), falsy ID fix, empty content block cleanup | Merged |
| PR #3 | get-transfers + get-transfer (account name resolution, transfer-not-expense labeling) | Merged |
| PR #4 | Enhanced get-transactions (recurring/installment columns, recurring_only filter, total income in summary) | Merged |
| PR #5 | get-spending-summary composite tool (transfers excluded, optional budget comparison) | Merged |
| PR #6 | Invoice payments enhancement (parallel fetch, payment status derived from balance_cents) | Merged |
| PR #7 | create-transaction (first write op, .int() + non-zero validation, MCP client approval, one-time only) | Merged |

---

## Session Log

### [2026-03-26] Session: v0.2.0 Implementation Sprint

**Participants:** Developer, QA (implicit via test plans)

**Summary:** All v0.2.0 work implemented and merged across 7 PRs. Shipped 4 new tools (get-transfers, get-transfer, get-spending-summary, create-transaction), enhanced 2 existing tools (get-transactions, get-invoice-payments), and landed all cross-cutting improvements (BRL locale, .describe() annotations, date validation, CachedLookup, JSON cap, bug fixes). Total tool count: 8 -> 12. All Finance Expert priorities and AI/MCP Expert audit findings addressed.

**PRs merged:** #1 through #7 (see PR Structure table above)

**Notable implementation details:**
- PR #1 and #2 split (zero-behavior-change vs behavioral) worked well per Challenger's suggestion
- get-transfer (single by ID) was added alongside get-transfers -- not originally planned but follows existing pattern
- Invoice payments got parallel fetch optimization and derived payment status from balance_cents
- create-transaction scoped to one-time only as planned; relies on MCP client approval per the "drop confirm" decision

---

### [2026-03-26] Session: v0.2.0 Planning Sprint

**Participants:** Finance Expert, AI/MCP Expert, Developer, Challenger, QA, Scribe

**Summary:** First full team planning session. Established priorities for the next iteration (v0.2.0), audited existing tools for AI-friendliness, produced implementation plan, challenged it, and wrote test plans.

**Key outputs by agent:**
- **Finance Expert:** Top 5 priority list -- (1) get-transfers, (2) enhanced get-transactions with recurring fields, (3) get-spending-summary composite tool, (4) create-transaction as first write op, (5) invoice payments. Quick wins: resolve category IDs to names, add total income to transaction summary, document the 10-row table cap.
- **AI/MCP Expert:** Full audit of all 8 tools. Critical: zero .describe() annotations. High: ID Trap (raw category_id in outputs), weak tool descriptions, undocumented date formats. Medium: USD currency (should be BRL), undocumented optional param defaults.
- **Developer:** Phased implementation plan -- Phase 0 (cross-cutting fixes), Phase 1 (new read tools), Phase 2 (first write op). 6 PRs mapped out.
- **Challenger:** Identified blockers (pagination, confirm guard is security theater, undefined required fields for create-transaction) and high-priority issues (cache TTL, amount validation, date regex). Developer resolved all blockers during the session.
- **QA:** Test plans for get-transfers, get-spending-summary, and create-transaction. Found 5 pre-existing bugs. Critical invariant: `confirm: false` must NEVER call the API (note: this was later superseded by the decision to drop confirm entirely).

---

## Decisions

### [2026-03-26] Decision: v0.2.0 scope -- phased rollout with cross-cutting fixes first

**Context:** Team needed to decide what to build next after the v0.1.0 foundation of 8 read-only tools.
**Decision:** v0.2.0 has three phases: Phase 0 = cross-cutting fixes (pagination, BRL, .describe(), descriptions, date validation, category cache, JSON cap, falsy ID fix). Phase 1 = new read tools (get-transfers, enhanced get-transactions, get-spending-summary, get-invoice-payments). Phase 2 = first write op (create-transaction, single one-time only).
**Rationale:** Finance Expert identified transfers as the biggest gap. AI/MCP Expert identified .describe() as highest-ROI. Challenger demanded pagination be resolved before any new tools. Developer structured phases so cross-cutting fixes land first, de-risking everything else.
**Trade-offs accepted:** Larger scope than originally planned, but phased PRs keep each change reviewable.
**Proposed by:** Finance Expert (priorities), AI/MCP Expert (schema improvements), Developer (phasing)
**Agreed by:** Challenger, QA

### [2026-03-26] Decision: .describe() annotations are mandatory for all params going forward

**Context:** AI/MCP Expert audit found that zero input params across all 8 tools have .describe() annotations, making it hard for AI models to know what to pass.
**Decision:** Every zod parameter must have a .describe() annotation. Date formats, default behaviors, and cross-references to other tools (e.g., "get account IDs from get-bank-accounts") must be documented in the annotation.
**Rationale:** This is how AI models decide what values to pass. Without descriptions, the AI has to guess formats, defaults, and valid values.
**Trade-offs accepted:** More verbose schema definitions, slightly more maintenance burden.
**Proposed by:** AI/MCP Expert
**Agreed by:** Developer, Finance Expert

### [2026-03-26] Decision: Tool descriptions must include when-to-use guidance

**Context:** AI/MCP Expert audit found most tool descriptions are one sentence that states the obvious (e.g., "Get transactions from the API").
**Decision:** Every tool description must answer: (1) what does this tool do, (2) when should the AI call this vs. another tool, (3) what filtering is available. No implementation details (URLs, HTTP methods).
**Rationale:** The description is the AI's selection criterion. Better descriptions reduce tool confusion and unnecessary calls.
**Trade-offs accepted:** None significant.
**Proposed by:** AI/MCP Expert
**Agreed by:** Developer

### [2026-03-26] Decision: Transfers are critical for data completeness

**Context:** Finance Expert flagged that without transfers, a user asking "where did my money go?" gets a misleading answer -- transfers out of checking appear as expenses.
**Decision:** get-transfers is the highest-priority new endpoint. Must show both sides (account from/to), support date range filtering, and clearly distinguish transfers from income/expenses.
**Rationale:** Cash flow analysis is a core use case, and it's broken without transfers.
**Trade-offs accepted:** Prioritizing transfers over create-transaction means users still can't write data back.
**Proposed by:** Finance Expert
**Agreed by:** Developer, Challenger

### [2026-03-26] Decision: Recurring transaction fields must be exposed in get-transactions output

**Context:** The Organizze API already returns `monthly_recurring`, `installments_count`, and `installment_number` but the current MCP tool ignores them.
**Decision:** Add these fields to the Transaction interface and include them in the response builder output. Add a `recurring_only` filter that requires `date_range` (enforced via Zod `.refine()`).
**Rationale:** Identifying subscriptions and recurring costs is extremely high value for users trying to reduce expenses. The data is already available; we just need to surface it.
**Trade-offs accepted:** Slightly larger response payloads. `recurring_only` filter adds client-side complexity.
**Proposed by:** Finance Expert
**Agreed by:** AI/MCP Expert, Developer

### [2026-03-26] Decision: Drop `confirm: boolean` guard -- rely on MCP client approval

**Context:** Challenger flagged that the `confirm: true` pattern is "security theater" -- an AI can just pass `true` without the user realizing. The real safety gate is the MCP client's built-in tool approval prompt.
**Decision:** Remove the `confirm` parameter from all write operations. Instead, rely on the MCP client (e.g., Claude Desktop) to show a tool approval dialog before executing. Tool descriptions will clearly state the tool performs a write operation.
**Rationale:** The MCP protocol already has a safety mechanism for this. Adding a redundant `confirm` param gives false confidence and adds noise to the schema.
**Trade-offs accepted:** Safety depends entirely on the MCP client implementation. If a client auto-approves tools, there is no safety gate.
**Proposed by:** Challenger (identified problem), Developer (proposed solution)
**Agreed by:** AI/MCP Expert

### [2026-03-26] Decision: create-transaction required fields and scope

**Context:** Challenger flagged that required fields for create-transaction were undefined.
**Decision:** Required: `description`, `date`, `amount_cents`, `category_id`, `account_id`. Optional: `notes`, `tags`, `paid`. Scope for v0.2.0: single one-time transactions only -- no recurring, no installments.
**Rationale:** Minimal viable write operation. Recurring/installment creation has complex side effects that need more design work.
**Trade-offs accepted:** Users cannot create recurring or installment transactions via MCP in v0.2.0.
**Proposed by:** Developer
**Agreed by:** Finance Expert, Challenger

### [2026-03-26] Decision: No pagination helper needed -- API is date-bounded

**Context:** Challenger identified pagination as a potential blocker -- silent data loss if the API paginates and we only fetch page 1. Investigation revealed the Organizze API uses date-based filtering only, not page/offset/cursor pagination.
**Decision:** No pagination helper needed. Results are bounded by date range. Mitigation: `date_range` `.describe()` annotations will recommend monthly queries to keep response sizes manageable. Phase 0 JSON cap still applies for large ranges.
**Rationale:** The API design eliminates the pagination concern entirely. Date-range guidance in .describe() is sufficient.
**Trade-offs accepted:** Very large date ranges could still return many results, but the JSON cap handles this.
**Proposed by:** Developer (investigation), Challenger (original concern)
**Agreed by:** Team lead

### [2026-03-26] Decision: Category cache with generic CachedLookup utility

**Context:** AI/MCP Expert flagged the "ID Trap" -- returning raw category_id without names. Developer proposed resolving IDs to names with an in-session cache.
**Decision:** Build a generic `CachedLookup<K,V>` utility (not a one-off category cache). TTL of 5 minutes. Graceful fallback to raw ID on fetch failure.
**Rationale:** The same pattern will be needed for account names and credit card names. Generic utility avoids copy-paste.
**Trade-offs accepted:** Slightly more upfront work than a simple category-specific cache.
**Proposed by:** Challenger (suggested generic utility), Developer (accepted)
**Agreed by:** All

### [2026-03-26] Decision: Date validation regex on all date params

**Context:** Challenger flagged that free-form date strings without format validation are a red flag.
**Decision:** Add `.regex(/^\d{4}-\d{2}-\d{2}$/)` to all zod date params in Phase 0.
**Rationale:** Prevents ambiguous date formats (e.g., "March 26") from reaching the API.
**Trade-offs accepted:** None significant.
**Proposed by:** Challenger
**Agreed by:** Developer

### [2026-03-26] Decision: amount_cents validation for create-transaction

**Context:** QA flagged sign ambiguity and the risk of passing dollars instead of cents.
**Decision:** Use `.int()` on the zod schema, reject 0 values, and document sign convention in `.describe()` (negative = expense, positive = income).
**Rationale:** Prevents the most common monetary input errors.
**Trade-offs accepted:** Users who want a zero-amount placeholder transaction cannot create one.
**Proposed by:** QA (raised concern), Developer (solution)
**Agreed by:** Finance Expert

### [2026-03-26] Decision: PR structure -- split PR 1 into 1a (annotations) and 1b (behavior)

**Context:** Challenger suggested splitting the cross-cutting PR to separate zero-behavior-change work from behavioral changes.
**Decision:** PR 1a = pure annotation and locale changes (no behavior change). PR 1b = cache, truncation, date validation, falsy ID fix (behavior changes).
**Rationale:** Easier to review. PR 1a is zero-risk and can merge immediately.
**Trade-offs accepted:** One more PR to manage.
**Proposed by:** Challenger
**Agreed by:** Developer

### [2026-03-26] Decision: Implementation follows model-first pattern

**Context:** Developer proposed a 4-step implementation pattern for each new feature.
**Decision:** Implementation order: (1) model/interface in organizze.models.ts, (2) service method in organizze.service.ts, (3) response builder in response-builders.ts, (4) tool definition in index.ts, (5) build check with npm run build.
**Rationale:** Established pattern from v0.1.0; consistency reduces bugs and review burden.
**Trade-offs accepted:** None, this is existing convention.
**Proposed by:** Developer
**Agreed by:** All

---

## Open Questions

### [2026-03-26] Open: Currency assumption

**Question:** Organizze is a Brazilian product -- should we assume all amounts are BRL, or should the user's account currency be detected?
**Why it matters:** Formatting and display, and any future multi-currency support. For now, the decision is to fix the formatter to BRL, but the broader question remains.
**Raised by:** Finance Expert (implicit)
**Status:** Open (pragmatic fix to BRL is in Phase 0, but detection question is unresolved)

### [2026-03-26] Open: Recurring transaction deletion safety

**Question:** How should delete-transaction handle recurring series? The API supports `update_future=true` and `update_all=true`, which could wipe past accounting records.
**Why it matters:** Irreversible data loss risk. Challenger suggested splitting into separate tools (delete-transaction for single, delete-recurring-series for series).
**Raised by:** Challenger
**Status:** Open -- deferred since write ops beyond create-transaction are not in v0.2.0 scope

### [2026-03-26] Open: Date locale handling

**Question:** Organizze dates are in the user's local timezone. Should we detect or document this assumption?
**Why it matters:** Date filtering and display could be off by a day for edge-case timezone scenarios.
**Raised by:** Challenger (nice-to-have)
**Status:** Open

### [2026-03-26] Open: Transfer API shape verification

**Question:** The Transfer interface is based on documented API fields, but has not been verified against actual API responses.
**Why it matters:** If the real response shape differs, the response builder will break or miss fields.
**Raised by:** Challenger
**Status:** Open -- should be verified when implementing get-transfers

## Resolved Questions

### [2026-03-26] Resolved: Pagination strategy

**Original question:** Do we silently truncate, return a `next_page` cursor, or fetch all pages?
**Resolution:** The Organizze API uses date-based bounds only -- no page/offset/cursor pagination exists. No helper needed. `.describe()` will recommend monthly queries; JSON cap handles large ranges. See Decision: "No pagination helper needed -- API is date-bounded."
**Resolved by:** Developer (investigation confirmed API behavior)

### [2026-03-26] Resolved: Write operation safety model

**Original question:** Is `confirm: true` sufficient, or do we need preview tools?
**Resolution:** Neither. Drop `confirm` entirely and rely on MCP client's built-in tool approval. See Decision: "Drop `confirm: boolean` guard -- rely on MCP client approval."
**Resolved by:** Developer, in response to Challenger critique
