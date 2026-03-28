# AGENTS.md — Design Spec

**Date:** 2026-03-28  
**Status:** Approved by product owner (conversation)  
**Deliverable:** Root-level `AGENTS.md` in the Eatro repository

## 1. Purpose

`AGENTS.md` is the single authoritative entry point for **AI agents and contributors** working in this repo. It states what the product is, how we expect work to be done (engineering bar), and **non-negotiable** technical rules. It complements the README but does not replace user-facing documentation.

## 2. Product context

**Eatro** is a **macronutrient tracking** application. Users log food and track protein, carbohydrates, fat, and calories in service of their nutrition goals.

**MealR** is the product’s differentiator: users can **compose meals on the fly**—including **while at the supermarket**—by combining foods into a meal without having planned everything in advance. The goal is **accurate, low-friction logging** in real-world shopping and meal-prep situations.

The product should optimize not only for fast entry, but also for **easy retrieval and editing** of previously entered information. Users need to be able to log, find, inspect, and correct food and meal information quickly.

## 3. Project stack (pointer)

The app is **React Native** with **Expo** and **TypeScript**. Package manager, scripts, and dependency versions are defined in `package.json` (e.g. **Yarn**, `yarn test`, `yarn lint`). The document should **not** duplicate the full dependency list; it should **orient** readers to that file.

## 4. Product priorities

When the document guides product or UX decisions, it should bias contributors toward these priorities:

- Preserve **fast, low-friction logging** over feature cleverness.
- Protect MealR’s value: **quick meal composition in real-world contexts**, especially while shopping or making decisions on the fly.
- Optimize for **easy retrieval and editing** of logged information, not just fast entry.
- Prefer changes that improve **clarity, speed, accuracy, and editability**.
- Be suspicious of additions that add steps, hide important nutrition information, or make meal composition or correction slower.
- When trade-offs exist, favor the path that helps users **log, find, and correct** information quickly.

## 5. Engineering standard (“senior staff engineer”)

The following behaviors are **explicit expectations** for agent and human contributors:

- **Simplicity and maintainability** over clever abstractions; prefer the smallest change that fits existing patterns.
- **Align with the codebase**: naming, file layout, state and data flow, navigation—extend established patterns before introducing new ones.
- **Clear boundaries**: avoid casually mixing UI concerns, domain logic, and persistence in the same place unless the nearby code already does so and the change stays local.
- **Surface trade-offs** when a decision is non-obvious (e.g. performance vs clarity, API shape, scope of change).
- **Review-quality diffs**: changes scoped to the task; avoid unrelated refactors or drive-by cleanup unless explicitly requested.
- **Preserve behavior** unless the task explicitly changes it.
- **Verification**: when behavior or contracts change, run **tests**; run **lint** when appropriate for the change.

## 6. Repo-specific guardrails

- **Write correct React**. Avoid `useRef`, `ref` props, and callback refs unless the need is truly **imperative** or required by a library integration.
- Do **not** use refs as a shortcut for state, derived state, or normal data flow.
- Prefer **props, state, memoization, and effects** over imperative coordination.
- Do not introduce new abstractions unless there is **repeated pain** or a **clear maintainability boundary** to justify them.
- Do not expand scope with unrelated cleanup unless explicitly requested.
- Follow local patterns when touching existing code, even if you might design it differently from scratch.
- When adding or changing behavior, think about how users will **retrieve, inspect, and edit** that information afterward.

## 7. Testing policy

- **Logic or behavior changes** must include **updates** to existing tests that cover the affected behavior.
- **New or materially changed** functionality that is **currently untested** must gain **new tests**.
- Prefer **targeted tests** that protect behavior over noisy tests that merely restate implementation details.
- **Layout**: follow existing conventions (e.g. colocated `*.test.ts` alongside modules, as in `src/db/repositories/`).
- Contributors should not claim work is done without verifying the relevant tests for the changed behavior.

## 8. Definition of done

The resulting `AGENTS.md` should state that work is not done unless:

- The requested problem is solved without widening scope unnecessarily.
- Existing behavior is preserved unless the task explicitly changes it.
- Tests were updated or added when logic or behavior changed.
- Relevant verification was run before claiming success, at minimum the tests related to the changed behavior.
- The diff is reviewable, follows local patterns, and leaves the touched area at least as clear as it was before.
- Structural trade-offs are explained briefly rather than hidden in the code.

## 9. Examples: good vs bad changes

The document should include a few short examples to make the guidance concrete:

- **Good:** add a small hook or helper after seeing repeated logic in nearby files.  
  **Bad:** introduce a new abstraction layer for a one-off change.
- **Good:** use state to drive a visible UI change.  
  **Bad:** use a ref to coordinate normal rendering behavior.
- **Good:** update tests when changing nutrition-calculation logic or editing flows.  
  **Bad:** change behavior and leave stale tests or no tests behind.
- **Good:** optimize for users to log, find, and edit meals quickly.  
  **Bad:** add extra steps that make correction or retrieval harder.

## 10. Document structure (implementation shape)

`AGENTS.md` should be organized for fast scanning:

1. Short title and one-sentence purpose.
2. **What is Eatro / MealR** (sections 2, condensed).
3. **Product Priorities** (section 4, bullet list).
4. **Engineering Standard** (section 5, bullet list).
5. **Repo-Specific Guardrails** (section 6, bullet list).
6. **Testing** (section 7, bullet list).
7. **Definition of Done** (section 8, bullet list).
8. **Examples: Good vs Bad Changes** (section 9, bullet list).
9. **Stack** (section 3, one short paragraph or bullet list), either near the top or bottom as long as it remains easy to find.

Tone: **playbook-style, concise, imperative, and actionable**—opinionated enough to guide agents toward good judgment without becoming a full contributor handbook.

## 11. Out of scope

- Creating or migrating content to `.cursor/rules/*.mdc` (optional future work; not part of this spec).
- Changing application code, tests, or CI (unless a follow-up task explicitly requires it).
- Duplicating README content beyond minimal orientation.

## 12. Success criteria

- `AGENTS.md` exists at the **repository root** and reflects the **full outline in Section 10** without internal contradiction.
- A new contributor (human or agent) can infer **product intent**, **engineering bar**, **repo-specific React/code-quality rules**, **testing obligations**, and **definition of done** without opening other files first—except `package.json` for exact commands and versions.
- The file feels **repo-specific and opinionated**, not like a generic engineering manifesto.
