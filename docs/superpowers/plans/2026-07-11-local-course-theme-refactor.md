# Local Course Theme Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace legacy Local Course color variables and literal colors with the shared Tailwind tokens defined in `src/styles/theme.css` without changing layout or behavior.

**Architecture:** Keep component markup and responsive utilities unchanged. Add one Node built-in test that scans the Local Course component sources for forbidden legacy color syntax and verifies the expected shared tokens, then update only color-related Tailwind classes.

**Tech Stack:** React 19, TypeScript 6, Tailwind CSS 4, Node.js built-in test runner, ESLint, Vite

## Global Constraints

- Do not change component structure, copy, data types, icons, layout utilities, or responsive breakpoints.
- Do not add dependencies or new theme tokens.
- Use direct Tailwind theme utilities rather than CSS variable aliases.
- Preserve all current untracked Local Course source files.
- Map colors exactly as approved in `docs/superpowers/specs/2026-07-11-local-course-theme-refactor-design.md`.

---

### Task 1: Add the Local Course theme contract test

**Files:**
- Create: `tests/local-course-theme.test.mjs`

**Interfaces:**
- Consumes: component source files under `src/pages/local-course/components`
- Produces: a test command, `node --test tests/local-course-theme.test.mjs`, that fails when legacy color variables or the two approved literal colors exist

- [ ] **Step 1: Write the failing test**

Create `tests/local-course-theme.test.mjs` with Node's built-in `node:test`, read all `.tsx` files in the component directory, assert that `/var\(--color-|bg-\[#(?:e4e4e4|ffebe5)\]/` does not match the combined source, and assert that the combined source contains `bg-main-2`, `bg-main-5`, `bg-gray-2`, `text-black`, and `border-gray-2`.

- [ ] **Step 2: Run the test to verify RED**

Run: `node --test tests/local-course-theme.test.mjs`

Expected: FAIL because the current components contain `var(--color-...)` and literal background colors.

### Task 2: Replace legacy tokens in Local Course components

**Files:**
- Modify: `src/pages/local-course/components/CourseMap.tsx`
- Modify: `src/pages/local-course/components/CourseReviewSection.tsx`
- Modify: `src/pages/local-course/components/CourseStopItem.tsx`
- Modify: `src/pages/local-course/components/HeroSection.tsx`
- Modify: `src/pages/local-course/components/InfoBadgesCard.tsx`
- Modify: `src/pages/local-course/components/OverviewCard.tsx`
- Modify: `src/pages/local-course/components/TitleSection.tsx`
- Test: `tests/local-course-theme.test.mjs`

**Interfaces:**
- Consumes: shared tokens exported by `src/styles/theme.css`
- Produces: Local Course components styled only with `main-*`, `green-*`, `blue-*`, `sky-*`, `gray-*`, `black`, and `white` color utilities

- [ ] **Step 1: Apply the exact token mapping**

Replace color classes without changing any non-color utility:

```text
bg-[var(--color-primary)]      -> bg-main-5
border-[var(--color-primary)]  -> border-main-5
text-[var(--color-primary)]    -> text-main-5
bg-[var(--color-surface)]      -> bg-white
text-[var(--color-surface)]    -> text-white
text-[var(--color-text)]       -> text-black
text-[var(--color-text-muted)] -> text-gray-5
text-[var(--color-text-subtle)]-> text-gray-4
text-[var(--color-text-disabled)] -> text-gray-3
border-[var(--color-line)]     -> border-gray-2
divide-[var(--color-line)]     -> divide-gray-2
bg-[var(--color-line)]         -> bg-gray-2
bg-[var(--color-green)]        -> bg-green-3
border-[var(--color-green)]    -> border-green-3
text-[var(--color-green)]      -> text-green-3
border-[var(--color-blue)]     -> border-blue-3
text-[var(--color-blue)]       -> text-blue-3
border-[var(--color-sky)]      -> border-sky-3
bg-[#e4e4e4]                   -> bg-gray-2
bg-[#ffebe5]                   -> bg-main-2
```

For the `sky` tag, use `border-sky-3 text-blue-3` to preserve the existing separate border and text semantics.

- [ ] **Step 2: Run the contract test to verify GREEN**

Run: `node --test tests/local-course-theme.test.mjs`

Expected: PASS with one passing test and zero failures.

- [ ] **Step 3: Inspect the focused diff**

Run: `git diff -- src/pages/local-course/components tests/local-course-theme.test.mjs`

Expected: only color-related class replacements plus the new contract test; no markup, copy, type, layout, or responsive changes.

### Task 3: Verify the refactor

**Files:**
- Verify: `src/pages/local-course/components/*.tsx`
- Verify: `tests/local-course-theme.test.mjs`

**Interfaces:**
- Consumes: the completed refactor from Task 2
- Produces: lint, TypeScript, and production build evidence

- [ ] **Step 1: Run lint**

Run: `npm.cmd run lint`

Expected: exit code 0 with no ESLint errors.

- [ ] **Step 2: Run the production build**

Run: `npm.cmd run build`

Expected: exit code 0 and Vite reports a successful build.

- [ ] **Step 3: Verify repository scope**

Run: `git status --short` and `git diff --check`

Expected: the pre-existing Local Course source files, the contract test, and planning documentation are the only task-related changes; no whitespace errors are reported.

- [ ] **Step 4: Commit the implementation**

```bash
git add src/pages/local-course/components src/pages/local-course/types tests/local-course-theme.test.mjs docs/superpowers/plans/2026-07-11-local-course-theme-refactor.md
git commit -m "refactor: local course 공통 테마 적용"
```
