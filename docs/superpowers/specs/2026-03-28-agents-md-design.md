# AGENTS.md — Design Spec

**Date:** 2026-03-28  
**Status:** Approved by product owner (conversation)  
**Deliverable:** Root-level `AGENTS.md` in the Eatro repository

## 1. Purpose

`AGENTS.md` is the single authoritative entry point for **AI agents and contributors** working in this repo. It states what the product is, how we expect work to be done (engineering bar), and **non-negotiable** technical rules. It complements the README but does not replace user-facing documentation.

## 2. Product context

**Eatro** is a **macronutrient tracking** application. Users log food and track protein, carbohydrates, fat, and calories in service of their nutrition goals.

**MealR** is the product’s differentiator: users can **compose meals on the fly**—including **while at the supermarket**—by combining foods into a meal without having planned everything in advance. The goal is **accurate, low-friction logging** in real-world shopping and meal-prep situations.

## 3. Project stack (pointer)

The app is **React Native** with **Expo** and **TypeScript**. Package manager, scripts, and dependency versions are defined in `package.json` (e.g. **Yarn**, `yarn test`, `yarn lint`). The document should **not** duplicate the full dependency list; it should **orient** readers to that file.

## 4. Engineering standard (“senior staff engineer”)

The following behaviors are **explicit expectations** for agent and human contributors:

- **Simplicity and maintainability** over clever abstractions; prefer the smallest change that fits existing patterns.
- **Align with the codebase**: naming, file layout, state and data flow, navigation—extend established patterns before introducing new ones.
- **Surface trade-offs** when a decision is non-obvious (e.g. performance vs clarity, API shape, scope of change).
- **Review-quality diffs**: changes scoped to the task; avoid unrelated refactors or drive-by cleanup unless explicitly requested.
- **Verification**: when behavior or contracts change, run **tests**; run **lint** when appropriate for the change.

## 5. React / React Native: refs policy

- **Avoid** `useRef`, `ref` props, and callback refs **except** when the use case is **imperative** or an established escape hatch:
  - **Imperative APIs**: focus management, scrolling, layout measurement, or integration with libraries that require a ref handle.
  - **Promises / async boundaries**: use refs only where holding a stable reference is the **idiomatic** pattern for that scenario in this codebase (not as a default substitute for state).
- **Default** data and UI flow: **props, state, and hooks**.

## 6. Testing policy

- **Logic or behavior changes** must include **updates** to existing tests that cover the affected behavior.
- **New or materially changed** functionality that is **currently untested** must gain **new tests**.
- **Layout**: follow existing conventions (e.g. colocated `*.test.ts` alongside modules, as in `src/db/repositories/`).

## 7. Document structure (implementation shape)

`AGENTS.md` should be organized for fast scanning:

1. Short title and one-sentence purpose.
2. **What is Eatro / MealR** (sections 2, condensed).
3. **Stack** (section 3, one short paragraph or bullet list).
4. **How we work** (section 4, bullet list).
5. **Refs** (section 5, bullet list).
6. **Testing** (section 6, bullet list).

Tone: **concise, imperative, actionable**—suitable for agents that read the file at session start.

## 8. Out of scope

- Creating or migrating content to `.cursor/rules/*.mdc` (optional future work; not part of this spec).
- Changing application code, tests, or CI (unless a follow-up task explicitly requires it).
- Duplicating README content beyond minimal orientation.

## 9. Success criteria

- `AGENTS.md` exists at the **repository root** and reflects sections 2–6 above without internal contradiction.
- A new contributor (human or agent) can infer **product intent**, **engineering bar**, **refs rules**, and **testing obligations** without opening other files first—except `package.json` for exact commands and versions.
