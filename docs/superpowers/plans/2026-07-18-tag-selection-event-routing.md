# Tag Selection Event Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 유효한 사진과 태그를 선택한 사용자가 `코스 선택하기` 버튼을 누르면 행사 선택 페이지로 이동하게 한다.

**Architecture:** 태그 선택 완료 조건은 기존대로 유지한다. 이동 경로와 완료 동작을 독립적인 navigation 함수로 분리해 Node 내장 테스트로 검증하고, `TagSelectionPage`는 React Router의 `useNavigate`를 해당 함수에 주입한다.

**Tech Stack:** React 19, TypeScript, React Router, Node `node:test`

## Global Constraints

- `/local-recommendation/event-selection` 기존 라우트를 사용한다.
- Zustand 상태 저장은 이번 범위에서 제외한다.
- Vitest 또는 새로운 테스트 의존성을 추가하지 않는다.
- 기존 버튼 활성화 조건과 `onComplete` 콜백 계약을 유지한다.

---

### Task 1: 태그 선택 완료 후 행사 선택 페이지 이동

**Files:**
- Create: `tests/tag-selection-navigation.test.ts`
- Create: `src/pages/local-recommendation/tag-selection/navigation.ts`
- Modify: `src/pages/local-recommendation/tag-selection/index.tsx`

**Interfaces:**
- Consumes: `PhotoSelection`, `TagId`, `TagSelectionResult`, React Router의 `NavigateFunction`
- Produces: `EVENT_SELECTION_PATH`, `completeTagSelection(options): boolean`

- [x] **Step 1: 실패하는 Node 테스트 작성**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  completeTagSelection,
  EVENT_SELECTION_PATH,
} from '../src/pages/local-recommendation/tag-selection/navigation.ts';
import type { TagId } from '../src/pages/local-recommendation/tag-selection/types.ts';

test('태그 선택 완료 결과를 전달하고 행사 선택 페이지로 이동한다', () => {
  const photo = new File(['image'], 'course.png', { type: 'image/png' });
  const completedResults: unknown[] = [];
  const navigatedPaths: string[] = [];

  const completed = completeTagSelection({
    photo: { file: photo, previewUrl: 'blob:course' },
    selectedTagIds: new Set<TagId>(['local-attraction']),
    onComplete: (result) => completedResults.push(result),
    navigate: (path) => navigatedPaths.push(path),
  });

  assert.equal(completed, true);
  assert.deepEqual(completedResults, [
    { photo, tagIds: ['local-attraction'] },
  ]);
  assert.deepEqual(navigatedPaths, [EVENT_SELECTION_PATH]);
});
```

- [x] **Step 2: 테스트가 예상대로 실패하는지 확인**

Run: `node --test --experimental-strip-types tests/tag-selection-navigation.test.ts`

Expected: `navigation.ts`가 아직 없어 `ERR_MODULE_NOT_FOUND`로 실패한다.

- [x] **Step 3: 완료 및 이동 유틸 최소 구현**

`src/pages/local-recommendation/tag-selection/navigation.ts`를 다음 내용으로 생성한다.

```ts
import type { PhotoSelection, TagId, TagSelectionResult } from './types.ts';

export const EVENT_SELECTION_PATH =
  '/local-recommendation/event-selection' as const;

interface CompleteTagSelectionOptions {
  photo: PhotoSelection;
  selectedTagIds: ReadonlySet<TagId>;
  onComplete?: (result: TagSelectionResult) => void;
  navigate: (path: typeof EVENT_SELECTION_PATH) => void;
}

export const completeTagSelection = ({
  photo,
  selectedTagIds,
  onComplete,
  navigate,
}: CompleteTagSelectionOptions): boolean => {
  onComplete?.({
    photo: photo.file,
    tagIds: Array.from(selectedTagIds),
  });
  navigate(EVENT_SELECTION_PATH);
  return true;
};
```

- [x] **Step 4: 페이지에 React Router 이동 주입**

`src/pages/local-recommendation/tag-selection/index.tsx`에서 `useNavigate`를 호출하고 기존 `handleComplete`를 다음처럼 교체한다.

```ts
const navigate = useNavigate();

const handleComplete = () => {
  completeTagSelection({
    photo,
    selectedTagIds,
    onComplete,
    navigate,
  });
};
```

- [x] **Step 5: 테스트와 정적 검증 실행**

Run:

```powershell
node --test --experimental-strip-types tests/tag-selection-navigation.test.ts
pnpm.cmd lint
pnpm.cmd build
```

Expected: Node 테스트 통과, ESLint 오류 0개, TypeScript/Vite 빌드 성공.

- [x] **Step 6: 관련 파일만 커밋**

```powershell
git add -- tests/tag-selection-navigation.test.ts src/pages/local-recommendation/tag-selection/navigation.ts src/pages/local-recommendation/tag-selection/index.tsx docs/superpowers/plans/2026-07-18-tag-selection-event-routing.md
git commit -m "feat: 태그 선택 후 행사 선택 페이지 이동"
```
