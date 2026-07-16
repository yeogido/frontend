# Event Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `행사 선택.svg`의 콘텐츠와 시각 구성을 보존한 새 행사 선택 페이지를 만들고, 검색 결과의 행사를 선택 목록에 추가하며 선택 여부에 따라 등록 버튼 상태를 제어한다.

**Architecture:** 새 `/local-recommendation/event-selection` 페이지가 검색어와 선택 상태를 소유한다. SVG에서 분리한 원본 이미지 에셋은 정규화된 태그 레지스트리로 관리하고, API 형태의 데이터는 순수 매퍼를 거쳐 UI 모델로 변환한다. 검색 결과와 선택 목록은 동일한 `FestivalCard`를 재사용하며 기존 `YeogidoCourseSearchBar`는 직접 import한다.

**Tech Stack:** React 19, TypeScript 6, React Router 7, Tailwind CSS 4, 기존 CSS 디자인 토큰

## Global Constraints

- 원본 레퍼런스는 `C:\Users\GYEONGJUN\Downloads\local-recommendation\UMC-여기도 (1)\행사 선택.svg`이다.
- 원본 SVG의 문구, 행사 정보, 이미지, 순서와 상태 표현을 수정하거나 생략하지 않는다.
- 실제 행사 검색·등록 API 엔드포인트는 만들거나 추측하지 않는다.
- 기존 `src/pages/yeogido-course/components/YeogidoCourseSearchBar.tsx`를 직접 import하고 해당 파일은 수정하지 않는다.
- 기존 `/local-recommendation` 페이지는 유지하고 새 경로 `/local-recommendation/event-selection`을 추가한다.
- 320px부터 430px까지 가변 모바일 레이아웃으로 구현하고 768px 이상에서는 최대 너비 430px로 중앙 정렬한다.
- 기존 `src/styles/theme.css`의 색상과 폰트 토큰을 우선 사용한다.
- `AGENTS.md`는 Git에 추가하거나 수정하거나 커밋하지 않는다.
- 저장소에 자동화 테스트 러너가 없으므로 새 테스트 의존성을 추가하지 않는다. 순수 함수는 TypeScript 타입 검사로, 상호작용은 브라우저 시나리오로 검증한다.

---

## File Structure

- Create: `src/pages/local-recommendation/event-selection/index.tsx` — 페이지 상태와 섹션 조합
- Create: `src/pages/local-recommendation/event-selection/types.ts` — API 경계와 UI 모델 타입
- Create: `src/pages/local-recommendation/event-selection/utils.ts` — 태그 정규화, 에셋 결합, 검색 필터
- Create: `src/pages/local-recommendation/event-selection/constants/referenceFestivals.ts` — SVG에 실제로 표시된 네 행사 정보만 보존하는 카탈로그
- Create: `src/pages/local-recommendation/event-selection/constants/festivalAssetRegistry.ts` — 정규화된 태그와 원본 이미지 에셋 매핑
- Create: `src/pages/local-recommendation/event-selection/components/FestivalCard.tsx` — 공통 행사 카드
- Create: `src/pages/local-recommendation/event-selection/components/FestivalSearchResults.tsx` — 검색 결과 목록과 추가 액션
- Create: `src/pages/local-recommendation/event-selection/components/SelectedFestivalList.tsx` — 선택된 행사 목록과 제거 액션
- Create: `src/pages/local-recommendation/event-selection/components/index.ts` — 행사 선택 전용 컴포넌트 export
- Create: `src/pages/local-recommendation/event-selection/assets/festival-thumbnail.png` — 네 행사 카드가 공통으로 사용하는 SVG `image1_768_4888` 원본 PNG
- Modify: `src/router/AppRouter.tsx` — 새 페이지 import와 route 등록

---

### Task 1: Preserve the SVG reference content and assets

**Files:**
- Create: `src/pages/local-recommendation/event-selection/types.ts`
- Create: `src/pages/local-recommendation/event-selection/assets/festival-thumbnail.png`
- Create: `src/pages/local-recommendation/event-selection/constants/referenceFestivals.ts`

**Interfaces:**
- Consumes: the four event rows and eight SVG image patterns (`pattern0` through `pattern7`) in `행사 선택.svg`
- Produces: `FestivalApiItem`, one lossless shared PNG, and `referenceFestivalRecords: readonly FestivalApiItem[]`

- [ ] **Step 1: Define the API boundary type used by the source catalog**

Create `types.ts`:

```ts
export interface FestivalApiItem {
  id: string;
  tag: string;
  title: string;
  period: string;
  location: string;
}
```

- [ ] **Step 2: Inspect the SVG structure without editing it**

Run:

```powershell
Select-String -LiteralPath 'C:\Users\GYEONGJUN\Downloads\local-recommendation\UMC-여기도 (1)\행사 선택.svg' -Pattern '<svg|<image|pattern[0-7]|translate\(24 (339|423|507|591)\)'
```

Expected: a `390 × 844` root SVG, four 68px event thumbnails at y positions `339`, `423`, `507`, and `591`, and two embedded PNG definitions. `pattern1`, `pattern3`, `pattern5`, and `pattern7` all reuse `image1_768_4888` with the same crop transform.

- [ ] **Step 3: Extract the shared visible source image without recompression**

Decode the `image1_768_4888` `data:image/png;base64,...` payload byte-for-byte into `festival-thumbnail.png`. The four cards use this same source and the same crop transform, so do not create four duplicate files or re-encode the PNG.

After extraction, verify every file is non-empty:

```powershell
Get-Item 'src\pages\local-recommendation\event-selection\assets\festival-thumbnail.png' |
  Select-Object Name,Length
```

Expected: one `festival-thumbnail.png` with `Length` greater than zero. No image conversion command should appear in shell history or the diff.

- [ ] **Step 4: Transcribe the exact reference content into the source catalog**

Create `referenceFestivals.ts` with `import type { FestivalApiItem } from '../types'` and an exported `referenceFestivalRecords` array using `as const satisfies readonly FestivalApiItem[]`. Add exactly four objects in SVG top-to-bottom order. Use stable ids `reference-festival-01` through `reference-festival-04`; use each exact visible event name as both its initial `tag` and `title`; copy each exact period and location including spacing and punctuation. Do not add descriptive stand-in strings or data that is not present in the SVG.

- [ ] **Step 5: Compare the inventory against the SVG**

Check all four records in top-to-bottom order. Confirm that every visible title, period, location, and thumbnail has exactly one catalog entry and no additional invented event is present.

- [ ] **Step 6: Commit the preserved reference data**

```powershell
git add src/pages/local-recommendation/event-selection/types.ts src/pages/local-recommendation/event-selection/assets src/pages/local-recommendation/event-selection/constants/referenceFestivals.ts
git commit -m "feat: 행사 선택 레퍼런스 데이터 추가"
```

Expected: one commit containing only the four source assets and the exact reference catalog.

---

### Task 2: Add the API-ready tag mapping boundary

**Files:**
- Create: `src/pages/local-recommendation/event-selection/constants/festivalAssetRegistry.ts`
- Create: `src/pages/local-recommendation/event-selection/utils.ts`

**Interfaces:**
- Consumes: `FestivalApiItem`, `festival-thumbnail.png`, `referenceFestivalRecords`
- Produces: `FestivalItem`, `normalizeFestivalTag`, `mapFestivalApiItem`, `filterFestivals`

- [ ] **Step 1: Extend the external model into the UI model**

Append the internal UI model to `types.ts`:

```ts
export interface FestivalItem extends FestivalApiItem {
  imageSrc: string | null;
}
```

- [ ] **Step 2: Create the normalized asset registry**

Create `festivalAssetRegistry.ts`. Build the registry from the exact tags in `referenceFestivalRecords`, since all four SVG cards use the same source PNG:

```ts
import festivalThumbnail from '../assets/festival-thumbnail.png';
import { referenceFestivalRecords } from './referenceFestivals';

export const festivalAssetRegistry: Readonly<Record<string, string>> =
  Object.fromEntries(
    referenceFestivalRecords.map(({ tag }) => [
      tag.trim().toLocaleLowerCase('ko-KR'),
      festivalThumbnail,
    ])
  );
```

- [ ] **Step 3: Implement pure normalization and mapping functions**

Create `utils.ts`:

```ts
import { festivalAssetRegistry } from './constants/festivalAssetRegistry';
import type { FestivalApiItem, FestivalItem } from './types';

export const normalizeFestivalTag = (tag: string) =>
  tag.trim().toLocaleLowerCase('ko-KR');

export const mapFestivalApiItem = (
  festival: FestivalApiItem
): FestivalItem => ({
  ...festival,
  imageSrc: festivalAssetRegistry[normalizeFestivalTag(festival.tag)] ?? null,
});

export const filterFestivals = (
  festivals: readonly FestivalApiItem[],
  query: string
): FestivalItem[] => {
  const normalizedQuery = normalizeFestivalTag(query);

  if (!normalizedQuery) {
    return festivals.map(mapFestivalApiItem);
  }

  return festivals
    .filter((festival) => {
      const normalizedTag = normalizeFestivalTag(festival.tag);
      const normalizedTitle = normalizeFestivalTag(festival.title);

      return (
        normalizedTag.includes(normalizedQuery) ||
        normalizedTitle.includes(normalizedQuery)
      );
    })
    .map(mapFestivalApiItem);
};
```

- [ ] **Step 4: Run type and formatting checks**

Run:

```powershell
pnpm exec prettier --check src/pages/local-recommendation/event-selection/types.ts src/pages/local-recommendation/event-selection/constants src/pages/local-recommendation/event-selection/utils.ts
pnpm exec tsc -b --pretty false
```

Expected: both commands exit with code 0. An unknown API tag must map to `imageSrc: null`; it must never reuse another event image.

- [ ] **Step 5: Commit the mapping boundary**

```powershell
git add src/pages/local-recommendation/event-selection/types.ts src/pages/local-recommendation/event-selection/constants/festivalAssetRegistry.ts src/pages/local-recommendation/event-selection/utils.ts
git commit -m "feat: 행사 태그 에셋 매핑 추가"
```

---

### Task 3: Build reusable event list components

**Files:**
- Create: `src/pages/local-recommendation/event-selection/components/FestivalCard.tsx`
- Create: `src/pages/local-recommendation/event-selection/components/FestivalSearchResults.tsx`
- Create: `src/pages/local-recommendation/event-selection/components/SelectedFestivalList.tsx`
- Create: `src/pages/local-recommendation/event-selection/components/index.ts`

**Interfaces:**
- Consumes: `FestivalItem`
- Produces: `FestivalCard`, `FestivalSearchResults`, `SelectedFestivalList`

- [ ] **Step 1: Implement the shared card contract**

Create `FestivalCard.tsx` with this public interface:

```ts
interface FestivalCardProps {
  festival: FestivalItem;
  action: 'add' | 'remove';
  disabled?: boolean;
  onAction: (festival: FestivalItem) => void;
}
```

The rendered structure must use:

```tsx
<article className="flex min-w-0 items-center gap-6">
  <div className="bg-gray-2 h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl">
    {festival.imageSrc ? (
      <img
        src={festival.imageSrc}
        alt={`${festival.title} 행사 이미지`}
        className="h-full w-full object-cover"
      />
    ) : null}
  </div>

  <div className="min-w-0 flex-1">
    <h3 className="text-black truncate text-sm font-semibold">
      {festival.title}
    </h3>
    <p className="text-gray-5 mt-2 truncate text-xs">{festival.period}</p>
    <p className="text-gray-5 mt-1 truncate text-xs">{festival.location}</p>
  </div>

  <button
    type="button"
    disabled={disabled}
    onClick={() => onAction(festival)}
    aria-label={`${festival.title} 행사 ${action === 'add' ? '추가' : '삭제'}`}
    className="border-gray-2 text-gray-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border disabled:cursor-default disabled:opacity-40"
  >
    <span aria-hidden="true">{action === 'add' ? '+' : '−'}</span>
  </button>
</article>
```

During implementation, adjust only typography, spacing, icon shape, and action visibility required to match the SVG exactly. Keep the semantic structure and prop contract unchanged.

- [ ] **Step 2: Implement the search result list**

Create `FestivalSearchResults.tsx`:

```tsx
import type { FestivalItem } from '../types';
import FestivalCard from './FestivalCard';

interface FestivalSearchResultsProps {
  festivals: readonly FestivalItem[];
  selectedFestivalIds: ReadonlySet<string>;
  onAdd: (festival: FestivalItem) => void;
}

function FestivalSearchResults({
  festivals,
  selectedFestivalIds,
  onAdd,
}: FestivalSearchResultsProps) {
  return (
    <div className="mt-5 flex flex-col gap-4">
      {festivals.map((festival) => (
        <FestivalCard
          key={festival.id}
          festival={festival}
          action="add"
          disabled={selectedFestivalIds.has(festival.id)}
          onAction={onAdd}
        />
      ))}
    </div>
  );
}

export default FestivalSearchResults;
```

- [ ] **Step 3: Implement the selected list**

Create `SelectedFestivalList.tsx`:

```tsx
import type { FestivalItem } from '../types';
import FestivalCard from './FestivalCard';

interface SelectedFestivalListProps {
  festivals: readonly FestivalItem[];
  onRemove: (festival: FestivalItem) => void;
}

function SelectedFestivalList({
  festivals,
  onRemove,
}: SelectedFestivalListProps) {
  if (festivals.length === 0) {
    return null;
  }

  return (
    <section className="mt-8" aria-labelledby="selected-festivals-title">
      <h2 id="selected-festivals-title" className="text-black text-base font-semibold">
        선택한 행사
      </h2>
      <div className="mt-4 flex flex-col gap-4">
        {festivals.map((festival) => (
          <FestivalCard
            key={festival.id}
            festival={festival}
            action="remove"
            onAction={onRemove}
          />
        ))}
      </div>
    </section>
  );
}

export default SelectedFestivalList;
```

Replace `선택한 행사` only if the SVG contains a different exact heading; never invent a second heading if the SVG has none.

- [ ] **Step 4: Export the focused components**

Create `components/index.ts`:

```ts
export { default as FestivalSearchResults } from './FestivalSearchResults';
export { default as SelectedFestivalList } from './SelectedFestivalList';
```

- [ ] **Step 5: Run component checks**

```powershell
pnpm exec prettier --check src/pages/local-recommendation/event-selection/components
pnpm exec tsc -b --pretty false
```

Expected: both commands exit with code 0 and no existing component file is modified.

- [ ] **Step 6: Commit the components**

```powershell
git add src/pages/local-recommendation/event-selection/components
git commit -m "feat: 행사 선택 목록 컴포넌트 추가"
```

---

### Task 4: Compose the page state and register the route

**Files:**
- Create: `src/pages/local-recommendation/event-selection/index.tsx`
- Modify: `src/router/AppRouter.tsx`

**Interfaces:**
- Consumes: `referenceFestivalRecords`, `filterFestivals`, `YeogidoCourseSearchBar`, result and selected list components
- Produces: routable `EventSelectionPage` at `/local-recommendation/event-selection`

- [ ] **Step 1: Implement page state with duplicate protection**

Create `event-selection/index.tsx`:

```tsx
import { useMemo, useState } from 'react';

import YeogidoCourseSearchBar from '../../yeogido-course/components/YeogidoCourseSearchBar';
import { FestivalSearchResults, SelectedFestivalList } from './components';
import { referenceFestivalRecords } from './constants/referenceFestivals';
import type { FestivalItem } from './types';
import { filterFestivals } from './utils';

function EventSelectionPage() {
  const [query, setQuery] = useState('');
  const [selectedFestivals, setSelectedFestivals] = useState<FestivalItem[]>([]);

  const searchResults = useMemo(
    () => filterFestivals(referenceFestivalRecords, query),
    [query]
  );

  const selectedFestivalIds = useMemo(
    () => new Set(selectedFestivals.map((festival) => festival.id)),
    [selectedFestivals]
  );

  const handleAddFestival = (festival: FestivalItem) => {
    setSelectedFestivals((currentFestivals) =>
      currentFestivals.some((item) => item.id === festival.id)
        ? currentFestivals
        : [...currentFestivals, festival]
    );
  };

  const handleRemoveFestival = (festival: FestivalItem) => {
    setSelectedFestivals((currentFestivals) =>
      currentFestivals.filter((item) => item.id !== festival.id)
    );
  };

  return (
    <div className="bg-pure-white mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-[430px] flex-col px-6 pb-6">
      <div className="flex-1 pt-10">
        <h1 className="text-black text-xl font-semibold">
          행사 선택
        </h1>

        <YeogidoCourseSearchBar
          className="mt-6 max-w-none"
          onSearch={setQuery}
        />

        <FestivalSearchResults
          festivals={searchResults}
          selectedFestivalIds={selectedFestivalIds}
          onAdd={handleAddFestival}
        />

        <SelectedFestivalList
          festivals={selectedFestivals}
          onRemove={handleRemoveFestival}
        />
      </div>

      <button
        type="button"
        disabled={selectedFestivals.length === 0}
        className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 mt-8 h-13 w-full rounded-xl text-sm font-semibold"
      >
        행사 등록하기
      </button>
    </div>
  );
}

export default EventSelectionPage;
```

Replace the `h1` text and its spacing only with the exact SVG title and layout. Keep the button text `행사 등록하기` and the disabled expression unchanged.

- [ ] **Step 2: Register the new route**

Add this import to `src/router/AppRouter.tsx`:

```ts
import EventSelectionPage from '../pages/local-recommendation/event-selection';
```

Add this route immediately after the existing `/local-recommendation` route:

```tsx
<Route
  path="/local-recommendation/event-selection"
  element={<EventSelectionPage />}
/>
```

- [ ] **Step 3: Match the SVG layout without fixed-width replication**

Compare the 390px render to the SVG and adjust the page/card Tailwind classes. Preserve these layout invariants:

```txt
page width: 100%
page max width: 430px
minimum supported viewport: 320px
reference horizontal padding: 24px
reference thumbnail: 68px × 68px
desktop behavior: centered single mobile column
```

Do not add a desktop grid, absolute-position the full page, or embed the SVG as a background.

- [ ] **Step 4: Run route and compile checks**

```powershell
pnpm exec prettier --check src/pages/local-recommendation/event-selection src/router/AppRouter.tsx
pnpm lint
pnpm build
```

Expected: all three commands exit with code 0. Existing Mojibake or unrelated warnings already present in untouched files must be reported separately and not silently fixed as part of this feature.

- [ ] **Step 5: Commit the page and route**

```powershell
git add src/pages/local-recommendation/event-selection/index.tsx src/router/AppRouter.tsx
git commit -m "feat: 행사 선택 페이지 경로 추가"
```

---

### Task 5: Verify responsive layout and interaction states

**Files:**
- Modify only if verification finds a scoped defect: files created in Tasks 1–4

**Interfaces:**
- Consumes: `/local-recommendation/event-selection`
- Produces: verified mobile layout and interaction behavior

- [ ] **Step 1: Start the local application**

```powershell
pnpm dev --host 127.0.0.1
```

Expected: Vite reports a local URL without compilation errors.

- [ ] **Step 2: Verify every required viewport**

Open `/local-recommendation/event-selection` and inspect widths `320`, `375`, `390`, `430`, `768`, `1024`, and `1440`.

At each width verify:

```txt
- no horizontal page scrollbar
- no clipped title, period, location, or action button
- 320–430px uses the available mobile width
- 768px and above keeps one centered column no wider than 430px
- source order and information priority do not change
```

- [ ] **Step 3: Verify event selection behavior**

Execute this scenario:

```txt
1. Load the page with no selected events.
2. Confirm “행사 등록하기” is disabled.
3. Submit an exact event tag through YeogidoCourseSearchBar.
4. Confirm only matching reference events remain in the result list.
5. Press the matching event’s + button.
6. Confirm the event appears once in the selected section.
7. Press the same + button again and confirm no duplicate is created.
8. Confirm “행사 등록하기” becomes enabled.
9. Remove the selected event.
10. Confirm the selected section disappears and the registration button becomes disabled again.
```

- [ ] **Step 4: Verify tag mapping behavior**

Temporarily inspect the pure mapper in the running page or debugger without committing diagnostic code:

```txt
- registered normalized tag → corresponding SVG source asset
- same tag with surrounding spaces → same asset
- same Latin tag with different case → same asset
- unknown tag → imageSrc is null
```

- [ ] **Step 5: Run final repository verification**

```powershell
pnpm lint
pnpm build
git diff --check
git status --short
```

Expected: lint and build succeed, `git diff --check` reports nothing, and status contains no unplanned files. `AGENTS.md` must not appear in tracked changes.

- [ ] **Step 6: Commit verification-only corrections if needed**

If Task 5 required scoped corrections:

```powershell
git add src/pages/local-recommendation/event-selection src/router/AppRouter.tsx
git commit -m "fix: 행사 선택 반응형 동작 보정"
```

If no correction was needed, do not create an empty commit.

---

## Final Review Checklist

- [ ] New route is `/local-recommendation/event-selection` and the existing route remains unchanged.
- [ ] `YeogidoCourseSearchBar.tsx` is imported directly and has no diff.
- [ ] Only SVG-visible event records exist in the reference catalog.
- [ ] Every API-shaped record maps by normalized `tag`; unknown tags receive no incorrect fallback image.
- [ ] `+` adds once, remove deletes the selected record, and the registration button follows selected count.
- [ ] SVG copy, image, order, spacing, colors, and states match at 390px.
- [ ] 320–430px is fluid and 768px+ is centered at max width 430px.
- [ ] `pnpm lint`, `pnpm build`, and `git diff --check` succeed.
