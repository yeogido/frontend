# 여기도 Frontend

## 프로젝트 소개

**여기도**는 사용자가 지역별 장소와 코스를 탐색하고, 추천 코스와 방문 기록을 작성할 수 있는 웹 서비스입니다.

주요 기능:

- 장소 탐색 및 검색
- 지역/카테고리 필터
- 지도 기반 장소 확인
- 장소 및 코스 상세 조회
- 코스 등록
- 방문 기록 작성
- 로그인/회원가입
- 마이페이지

---

## 팀원 및 역할 분담

| 이름 | 역할 | 담당 |
| --- | --- | --- |
| 김태혁 | A | 공통 기반 + 홈 |
| 윤선민 | B | 인증 + 유저 + 기록 |
| 이경준 | C | 장소 탐색 + 검색 + 필터 + 지도 |
| 이준혁 | D | 코스/장소 상세 + 코스 등록 |

### A. 공통 기반 + 홈

담당자: 김태혁

담당 업무:

- 프로젝트 기본 구조 관리
- 라우팅 설정
- 공통 레이아웃 구현
- 공통 UI 컴포넌트 구현
- 홈 화면 구현
- 전역 UI 상태 관리

담당 파일:

```txt
components/common
components/layout
components/ui
components/home
pages/HomePage
router
styles
store/ui.store.ts
```

### B. 인증 + 유저 + 기록

담당자: 윤선민

담당 업무:

- 로그인
- 회원가입
- 프로필 설정
- 마이페이지
- 방문 기록 목록
- 방문 기록 작성

담당 파일:

```txt
components/auth
components/record
pages/auth
pages/mypage
pages/records
store/auth.store.ts
apis/auth.api.ts
apis/user.api.ts
apis/record.api.ts
```

### C. 장소 탐색 + 검색 + 필터 + 지도

담당자: 이경준

담당 업무:

- 장소 목록
- 장소 검색
- 지역 필터
- 카테고리 필터
- 지도 화면
- 장소 좋아요

담당 파일:

```txt
components/place
pages/places
store/placeFilter.store.ts
apis/place.api.ts
hooks/usePlaces.ts
types/place.type.ts
```

### D. 코스/장소 상세 + 코스 등록

담당자: 이준혁

담당 업무:

- 장소 상세
- 코스 목록
- 코스 상세
- 코스 생성
- 코스에 장소 추가
- 사진 및 해시태그 등록

담당 파일:

```txt
components/course
pages/courses
pages/places/PlaceDetailPage
store/courseCreate.store.ts
apis/course.api.ts
apis/image.api.ts
hooks/useCourses.ts
types/course.type.ts
```

---

## 기술 스택

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- TanStack React Query
- Zustand
- React Hook Form
- Zod
- Axios
- ESLint
- Prettier
- npm

---

## 폴더 구조

```text

📂 폴더 구조 (Directory Structure)



```text

📦 src
 ┣ 📂 apis                 # API 통신 관련 설정 및 도메인별 API 함수
 ┃ ┣ 📜 axios.ts           # Axios 인스턴스 및 인터셉터 설정
 ┃ ┣ 📜 auth.api.ts        # 인증 관련 API
 ┃ ┣ 📜 user.api.ts        # 사용자 정보 관련 API
 ┃ ┣ 📜 place.api.ts       # 장소 도메인 API
 ┃ ┣ 📜 course.api.ts      # 코스 도메인 API
 ┃ ┣ 📜 record.api.ts      # 기록 도메인 API
 ┃ ┗ 📜 image.api.ts       # 이미지 업로드/처리 API
 ┃
 ┣ 📂 components           # UI 컴포넌트 (도메인 및 역할별 분리)
 ┃ ┣ 📂 common             # 전역에서 재사용되는 공통 컴포넌트 (버튼, 인풋 등)
 ┃ ┣ 📂 layout             # 레이아웃 컴포넌트 (헤더, 푸터, 내비게이션 등)
 ┃ ┣ 📂 ui                 # 기본 UI 요소 컴포넌트
 ┃ ┣ 📂 home               # 메인 홈페이지 전용 컴포넌트
 ┃ ┣ 📂 auth               # 인증 관련 컴포넌트 (로그인/회원가입 폼 등)
 ┃ ┣ 📂 place              # 장소 관련 컴포넌트
 ┃ ┣ 📂 course             # 코스 관련 컴포넌트
 ┃ ┗ 📂 record             # 기록 관련 컴포넌트
 ┃
 ┣ 📂 hooks                # 재사용 가능한 커스텀 훅 (비즈니스 로직, API 패칭 등)
 ┃ ┣ 📜 useAuth.ts
 ┃ ┣ 📜 usePlaces.ts
 ┃ ┣ 📜 useCourses.ts
 ┃ ┗ 📜 useRecords.ts
 ┃
 ┣ 📂 pages                # 라우팅되는 페이지 컴포넌트 (View)
 ┃ ┣ 📂 HomePage           # 메인 페이지
 ┃ ┣ 📂 auth               # 로그인, 회원가입 페이지
 ┃ ┣ 📂 places             # 장소 탐색 및 상세 페이지
 ┃ ┣ 📂 courses            # 코스 탐색 및 상세 페이지
 ┃ ┣ 📂 records            # 기록 목록 및 상세 페이지
 ┃ ┗ 📂 mypage             # 마이페이지
 ┃
 ┣ 📂 store                # 전역 상태 관리 (Zustand, Redux 등)
 ┃ ┣ 📜 auth.store.ts      # 로그인/유저 상태 관리
 ┃ ┣ 📜 placeFilter.store.ts # 장소 필터링 상태 관리
 ┃ ┣ 📜 courseCreate.store.ts# 코스 생성 진행 상태 관리
 ┃ ┗ 📜 ui.store.ts        # 모달, 토스트 등 UI 상태 관리
 ┃
 ┗ 📂 types                # 공통 TypeScript 타입 및 인터페이스 정의
   ┣ 📜 auth.type.ts
   ┣ 📜 user.type.ts
   ┣ 📜 place.type.ts
   ┣ 📜 course.type.ts
   ┣ 📜 record.type.ts
   ┗ 📜 api.type.ts        # 공통 API 응답/에러 타입
```

---

## 브랜치 컨벤션

브랜치 구조:

```txt
main
develop
feature/*
fix/*
refactor/*
docs/*
chore/*
```

브랜치 역할:

```txt
main      배포/시연 가능한 안정 버전
develop   개발 통합 브랜치
feature   기능 개발
fix       버그 수정
refactor  리팩토링
docs      문서 수정
chore     설정 및 기타 작업
```

브랜치 생성:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/기능명
```

PR 방향:

```txt
feature/* -> develop
fix/* -> develop
refactor/* -> develop
docs/* -> develop
chore/* -> develop

develop -> main
```

브랜치 예시:

```txt
feature/home-page
feature/auth-login
feature/place-search
feature/course-create
fix/login-validation
refactor/common-button
docs/readme
```

규칙:

- `main` 직접 push 금지
- 개인 이름 브랜치 사용 금지
- 기능 단위로 브랜치 생성
- PR 전 `main` 최신 반영

---

## 커밋 컨벤션

형식:

```txt
type: 작업 내용
```

타입:

```txt
| :--- | :--- |
| feat | 새로운 기능 추가 |
| fix | 버그 수정 |
| docs | 문서 수정 (README 등) |
| style | 코드 스타일 변경 (포맷팅, 세미콜론 누락 등) |
| design | 사용자 UI 디자인 변경 (CSS 등) |
| refactor | 코드 리팩토링 |
| test | 테스트 코드 작성 |
| build | 빌드 파일 수정 |
| ci | CI 설정 파일 수정 |
| perf | 성능 개선 |
| chore | 패키지 매니저 설정, 기타 운영 코드 변경 |
| rename | 파일 혹은 폴더명 수정 |
| remove | 파일 삭제 |

예시:

```txt
feat: 로그인 페이지 구현
feat: 장소 검색 필터 구현
fix: 로그인 유효성 검사 오류 수정
refactor: 공통 Button 컴포넌트 분리
style: 홈 화면 카드 간격 수정
chore: React Query Provider 설정
docs: README 작성
```

규칙:

- 한글 사용 가능
- 끝에 마침표 사용 안 함
- 한 커밋에는 하나의 의도만 포함
- `수정`, `작업`, `최종` 같은 모호한 메시지 금지

---

## PR 컨벤션

PR 제목:

```txt
[타입] 작업 요약
```

타입:

```txt
[FEAT] 기능 추가
[FIX] 버그 수정
[REFACTOR] 리팩토링
[STYLE] UI/CSS 수정
[CHORE] 설정 및 기타 작업
[DOCS] 문서 수정
```

예시:

```txt
[FEAT] 로그인 페이지 구현
[FEAT] 장소 검색 및 필터 기능 구현
[FIX] 로그인 유효성 검사 오류 수정
[REFACTOR] 공통 Button 컴포넌트 분리
```

PR 템플릿:

```md
## 작업 내용

- 

## 변경 화면

- 

## 확인 방법

1. 

## 체크리스트

- [ ] 로컬 실행 확인
- [ ] 콘솔 에러 없음
- [ ] 반응형 확인
- [ ] 불필요한 console.log 제거
- [ ] develop 최신 반영 완료
- [ ] 관련 없는 파일 변경 없음

## 스크린샷

<!-- UI 변경 시 첨부 -->

## 참고 사항

<!-- 리뷰어가 알아야 할 내용 -->
```

PR 규칙:

- 하나의 PR에는 하나의 기능 또는 목적만 포함
- 리뷰어 최소 1명 지정
- UI 변경 시 스크린샷 첨부
- 가능하면 `pnpm lint`, `pnpm build` 확인 후 PR 생성
- Merge 방식은 `Squash and merge`

---

## 실행 방법

패키지 설치:

```bash
pnpm install
```

개발 서버 실행:

```bash
pnpm dev
```

빌드:

```bash
pnpm build
```

린트:

```bash
pnpm lint
```

프리뷰:

```bash
pnpm preview
```

---

## 화면 목록 및 플로우

라우트:

```txt
/                  홈
/login             로그인
/signup            회원가입
/profile           프로필 설정
/places            장소 목록
/places/search     장소 검색
/places/map        지도 탐색
/places/:placeId   장소 상세
/courses           코스 목록
/courses/:courseId 코스 상세
/courses/new       코스 등록
/records           방문 기록 목록
/records/new       방문 기록 작성
/mypage            마이페이지
```

플로우:

```txt
인증:
홈 -> 로그인 -> 회원가입/소셜 로그인 -> 프로필 설정 -> 홈

장소 탐색:
홈 -> 장소 목록 -> 검색/필터 -> 장소 상세

지도 탐색:
홈 -> 지도 화면 -> 주변 장소 확인 -> 장소 상세

코스 조회:
홈 -> 코스 목록 -> 코스 상세

코스 등록:
코스 등록 -> 장소 검색 -> 장소 선택 -> 코스 정보 입력 -> 사진/해시태그 추가 -> 등록 완료

방문 기록:
마이페이지 -> 방문 기록 -> 기록 작성 -> 장소 선택 -> 날짜 선택 -> 사진 추가 -> 기록 완료
```

---

## 상태 관리 기준

```txt
Zustand
  클라이언트 전역 상태 관리
  auth.store.ts
  placeFilter.store.ts
  courseCreate.store.ts
  ui.store.ts

React Query
  서버 상태 관리
  장소 목록
  장소 상세
  코스 목록
  코스 상세
  방문 기록
  사용자 정보
```

```txt
Zustand = 클라이언트 UI 상태
React Query = 서버에서 받아오는 데이터
```
