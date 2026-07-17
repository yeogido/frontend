# 태그 선택에서 행사 선택으로 이동 설계

## 목표

`/local-recommendation/tag-selection`에서 필수 사진과 태그를 선택한 사용자가 `코스 선택하기` 버튼을 누르면 `/local-recommendation/event-selection`으로 이동한다.

## 범위

- `TagSelectionPage`에서 React Router의 `useNavigate`를 사용한다.
- 기존 사진·태그 유효성 검사와 버튼 비활성화 조건을 유지한다.
- 유효한 선택 상태에서 버튼을 누르면 기존 `onComplete` 콜백을 먼저 호출하고 행사 선택 페이지로 이동한다.
- 기존에 등록된 `/local-recommendation/event-selection` 라우트를 그대로 사용한다.

## 제외 범위

- 사진, 태그 및 다른 코스 등록 단계의 데이터를 Zustand에 저장하지 않는다.
- 페이지 새로고침 또는 뒤로 가기 시 입력 상태 복구를 구현하지 않는다.
- 전체 코스 등록 데이터 흐름과 API 제출을 변경하지 않는다.

## 후속 작업

모든 코스 등록 페이지가 완성된 후 별도 데이터 관리 작업에서 Zustand 스토어를 도입해 기본 정보, 사진, 태그, 행사 선택값을 통합 관리한다.

## 검증

- 필수 선택이 완료되지 않으면 버튼이 비활성화 상태를 유지한다.
- 필수 선택 완료 후 버튼을 누르면 행사 선택 경로로 이동한다.
- TypeScript 빌드와 ESLint 검사를 통과한다.
- 새로운 Vitest 의존성은 추가하지 않는다.
