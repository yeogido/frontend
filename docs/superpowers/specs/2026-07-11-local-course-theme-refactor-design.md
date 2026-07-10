# Local Course Theme Refactor Design

## Goal

`src/pages/local-course/components`에서 사용하는 기존 CSS 변수와 하드코딩 색상을 `src/styles/theme.css`의 공통 Tailwind 테마 토큰으로 교체한다. 레이아웃, 반응형 동작, 데이터 구조, 사용자 상호작용은 변경하지 않는다.

## Current State

Local Course 컴포넌트는 다음과 같이 현재 테마에 정의되지 않은 이전 변수 체계를 참조한다.

- `--color-primary`
- `--color-surface`
- `--color-text`
- `--color-text-muted`
- `--color-text-subtle`
- `--color-text-disabled`
- `--color-line`
- `--color-green`, `--color-blue`, `--color-sky`

또한 일부 배경색은 `bg-[#e4e4e4]`, `bg-[#ffebe5]`처럼 직접 지정되어 있다. 공통 테마는 `main`, `green`, `blue`, `sky`, `gray` 색상 단계를 Tailwind 유틸리티로 제공한다.

## Chosen Approach

컴포넌트에서 이전 CSS 변수를 계속 참조하거나 별칭을 추가하지 않고, 공통 테마의 Tailwind 클래스를 직접 사용한다. 이 방식은 사용되는 디자인 토큰을 클래스 이름에서 바로 확인할 수 있고, 폐기 대상인 이전 변수 체계가 남지 않는다.

컴포넌트별 CSS 파일은 추가하지 않는다. 현재 프로젝트의 Tailwind 중심 스타일링 방식과 일관성을 유지한다.

## Token Mapping

| Existing usage | Shared theme token |
| --- | --- |
| `--color-primary` | `main-5` |
| `--color-surface` | `white` |
| `--color-text` | `black` |
| `--color-text-muted` | `gray-5` |
| `--color-text-subtle` | `gray-4` |
| `--color-text-disabled` | `gray-3` |
| `--color-line` | `gray-2` |
| `--color-green` | `green-3` |
| `--color-blue` | `blue-3` |
| `--color-sky` | `sky-3` |
| `#e4e4e4` | `gray-2` |
| `#ffebe5` | `main-2` |

색상 단계는 기존 화면의 의미와 대비를 보존하는 방향으로 선택한다. 태그 테두리와 아이콘처럼 강조가 필요한 색상은 각 팔레트의 3단계를 사용하고, 기본 강조색은 `main-5`를 사용한다.

## Files in Scope

- `src/pages/local-course/components/CourseMap.tsx`
- `src/pages/local-course/components/CourseReviewSection.tsx`
- `src/pages/local-course/components/CourseStopItem.tsx`
- `src/pages/local-course/components/HeroSection.tsx`
- `src/pages/local-course/components/InfoBadgesCard.tsx`
- `src/pages/local-course/components/OverviewCard.tsx`
- `src/pages/local-course/components/TitleSection.tsx`

`icons.ts`, `types/course.ts`, `index.tsx`는 토큰 교체가 필요하지 않으면 수정하지 않는다.

## Testing and Verification

현재 프로젝트에 컴포넌트 테스트 러너가 없으므로 새 테스트 의존성을 도입하지 않는다. 대신 리팩토링 전 실패하는 정적 검사를 작성해 Local Course 파일에 이전 CSS 변수나 색상 리터럴이 남아 있음을 확인하고, 교체 후 동일 검사가 통과하는지 확인한다.

최종 검증은 다음 순서로 진행한다.

1. 이전 변수와 색상 리터럴 검색 결과가 없는지 확인한다.
2. `npm.cmd run lint`를 실행한다.
3. `npm.cmd run build`를 실행한다.
4. Git diff를 검토해 레이아웃, 동작, 관련 없는 파일이 변경되지 않았는지 확인한다.

## Non-goals

- 컴포넌트 구조 변경 또는 공통 컴포넌트 추출
- 레이아웃 및 반응형 브레이크포인트 변경
- 텍스트, 데이터 모델, 아이콘 변경
- 새로운 컬러 토큰 추가
- 시각 디자인 재설계
