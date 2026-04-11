# Eatro Agent Guide

This is the default onboarding context for agents and contributors working in this repo. Use it first. Keep decisions aligned with the product and these guardrails.

## Why This App Exists

Eatro is a macronutrient tracking app. Users log food and track protein, carbs, fat, and calories against their nutrition goals.

MealR is the differentiator: it lets users compose meals on the fly, including while at the supermarket, so logging stays fast and accurate in real situations.

This app should optimize not only for fast entry, but also for easy retrieval and editing of previously entered information. Users need to be able to log, find, inspect, and correct food and meal information quickly.

## Product Priorities

- Preserve fast, low-friction logging over feature cleverness.
- Protect MealR's value: quick meal composition in real-world contexts, especially while shopping.
- Optimize for easy retrieval and editing of logged information, not just fast entry.
- Be suspicious of changes that add steps, hide important nutrition information, or make correction slower.

## What To Know About This Repo

- This is a React Native app built with Expo and TypeScript.
- `src/screens/` contains product flows, including `src/screens/MealR/` for the core MealR experience.
- `src/db/` contains schemas, repositories, hooks, and migrations.
- `src/components/` contains reusable UI building blocks.
- `src/api/` contains API clients and validators.
- Check `package.json` for scripts, package manager, and exact dependency versions. Common verification commands are `yarn test` and `yarn lint`.

## How To Work Here

- Act like a senior staff engineer: make the smallest change that solves the problem well.
- Prefer simple, maintainable code over clever abstractions.
- Match existing repo patterns before introducing new ones.
- Keep boundaries clear. Do not casually mix UI concerns, domain logic, and persistence in the same place unless the nearby code already does so and the change stays local.
- Call out trade-offs before making structural changes.
- Keep diffs reviewable and scoped. Avoid drive-by refactors.
- Preserve current behavior unless the task explicitly changes it.
- Favor changes that help users log, find, and edit information quickly. Be suspicious of additions that add steps or make correction slower.

## Communication Style

- Default to caveman skill in full mode for normal agent responses in this repo. Activate it with `/caveman full`.
- Keep code, commits, and PR text normal unless the user explicitly asks otherwise.

## React Guardrails

- Write correct React. Avoid `useRef`, `ref` props, and callback refs unless the need is truly imperative or required by a library integration.
- Do not use refs as a shortcut for state, derived state, or normal data flow.
- Prefer props, state, memoization, and effects over imperative coordination.
- Do not introduce new abstractions unless there is repeated pain or a clear maintainability boundary to justify them.

## Testing And Verification

- If logic or behavior changes, you must update the tests that cover that behavior.
- If functionality is added or materially changed and it is currently untested, you must add tests.
- Prefer targeted tests that protect behavior over noisy tests that restate implementation details.
- Follow the repo's existing test placement and style, including colocated `*.test.ts` files where that pattern already exists, such as `src/db/repositories/`.
- Do not claim work is done without running the relevant tests for the changed behavior.
- Run lint when the change could affect code quality, types, or contracts.

## Definition Of Done

- The requested problem is solved without widening scope unnecessarily.
- Existing behavior is preserved unless the task explicitly changes it.
- Tests were updated or added when logic or behavior changed.
- Relevant verification was run before claiming success, at minimum the tests related to the changed behavior.
- The diff is reviewable, follows local patterns, and leaves the touched area at least as clear as it was before.
- If a structural trade-off was made, explain it briefly rather than hiding it in the code.

## Good Vs Bad Changes

- Good: use state to drive UI behavior. Bad: use refs for normal rendering or data flow.
- Good: update or add tests when logic changes. Bad: change behavior and leave stale or missing coverage behind.
- Good: make logging, retrieval, and editing faster or clearer. Bad: add friction or hide important nutrition information.

## Progressive Disclosure

Read more only when relevant:

- `package.json` for scripts, package manager, and dependency versions.
- `src/screens/MealR/` for MealR flow behavior.
- `src/db/repositories/` for repository and colocated test patterns.
- `docs/superpowers/specs/` and `docs/superpowers/plans/` only when continuing prior design or planning work.

## Caveman Activation Prompt

Terse like caveman. Technical substance exact. Only fluff die.
Drop: articles, filler (just/really/basically), pleasantries, hedging.
Fragments OK. Short synonyms. Code unchanged.
Pattern: [thing] [action] [reason]. [next step].
ACTIVE EVERY RESPONSE. No revert after many turns. No filler drift.
Code/commits/PRs: normal. Off: "stop caveman" / "normal mode".

