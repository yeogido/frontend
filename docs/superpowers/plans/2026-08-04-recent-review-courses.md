# Recent Review Courses Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a reusable course-review card and a `/recent-review-courses` listing page, then route the home review action to it.

**Architecture:** A shared `CourseReviewCard` combines existing course, tag, profile, star, and like visual patterns. The new page owns temporary mock entries; the router and home section only handle navigation.

**Tech Stack:** React 19, TypeScript, React Router, Tailwind CSS, Node test runner.

## Global Constraints

- Keep `/review` as the existing review-writing page.
- No new dependencies or API requests.
- Follow Figma node `642:3514`, using matching project assets and accessible controls.

---

### Task 1: Shared CourseReviewCard

**Files:**

- Create: `src/components/common/CourseReviewCard.tsx`
- Modify: `src/components/common/index.ts`
- Test: `tests/recent-review-courses-ui.test.ts`

**Interfaces:**

- Consumes: `TagChip`, `TagType`, and existing calendar, location, people, heart, and star assets.
- Produces: `CourseReviewCard` with course fields (`image`, `title`, `duration`, `courseType`, `companion`, `tags`) and review fields (`profileImage`, `nickname`, `meta`, `content`, `rating`), plus optional interactions (`liked`, `onClick`, `onLikeClick`).

- [ ] **Step 1: Write the failing test**

```ts
test('CourseReviewCard exposes course and review props', () => {
  const source = readFileSync('src/components/common/CourseReviewCard.tsx', 'utf8');
  for (const prop of ['title', 'duration', 'tags', 'nickname', 'content', 'rating']) {
    assert.match(source, new RegExp(`\\b${prop}\\b`));
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/recent-review-courses-ui.test.ts`

Expected: FAIL because the component file does not exist.

- [ ] **Step 3: Write minimal implementation**

Create the 342px Figma card with a course row, tag chips, divider, and reviewer row. Reuse the specified assets and `TagChip`, with optional keyboard-accessible card navigation and a labelled like button.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/recent-review-courses-ui.test.ts`

Expected: PASS.

### Task 2: Page and home navigation

**Files:**

- Create: `src/pages/recent-review-courses/index.tsx`
- Modify: `src/router/AppRouter.tsx`
- Modify: `src/pages/home/components/ReviewSection.tsx`
- Modify: `tests/recent-review-courses-ui.test.ts`

**Interfaces:**

- Consumes: the common `CourseReviewCard` and the standard main-layout route shell.
- Produces: public `/recent-review-courses` route and home action navigation to the route.

- [ ] **Step 1: Extend the failing test**

```ts
test('route and home action use the dedicated recent review course page', () => {
  assert.match(readFileSync('src/router/AppRouter.tsx', 'utf8'), /path="\\/recent-review-courses"/);
  assert.match(readFileSync('src/pages/home/components/ReviewSection.tsx', 'utf8'), /navigate\('\/recent-review-courses'\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/recent-review-courses-ui.test.ts`

Expected: FAIL because the dedicated route and navigation are not present.

- [ ] **Step 3: Write minimal implementation**

Create a title and subtitle matching Figma, then render page-local mock entries in a 16px-spaced vertical `CourseReviewCard` list. Add the public route under `MainLayout`, and replace only `navigate('/review')` in `ReviewSection`.

- [ ] **Step 4: Run focused and project verification**

Run: `npm test -- --run tests/recent-review-courses-ui.test.ts`, `npm run lint`, and `npm run build`.

Expected: all commands exit with status 0.
