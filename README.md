# 여기도 Frontend

## 프로젝트 소개

**여기도**는 전국의 추천 코스와 지역 축제·문화행사, 동네 소상공인 정보를 한곳에서 탐색하고, 직접 다녀온 곳을 기록으로 남길 수 있는 여행 서비스입니다.

"어디로 여행 갈지 정하기부터, 다녀와서 기록을 남기기까지"의 흐름을 하나의 앱에서 해결하는 것을 목표로 합니다.

- **어떤 서비스인가** — 관리자가 큐레이션한 전국 단위 추천 코스("여기도 추천 코스")와, 실제 그 동네에 사는 사용자가 직접 등록한 코스("우리동네 추천 코스")를 함께 보여주고, 지역 축제·문화행사 및 동네 소상공인 홍보 정보까지 지도 기반으로 탐색할 수 있는 서비스입니다.
- **어떤 문제를 해결하는가** — 여행 정보가 코스/행사/맛집 등 여러 채널에 흩어져 있는 문제를, 한 코스 안에 방문 장소·인근 행사·이동 시간까지 묶어서 보여주는 방식으로 해결합니다. 또한 공공데이터(한국관광공사 문화콘텐츠)를 관리자가 수동으로 하나씩 등록하지 않고 동기화 후 검수·게시하는 파이프라인으로 콘텐츠 최신성을 유지합니다.
- **핵심 기능**
  - 여기도 추천 코스(공식) / 우리동네 추천 코스(사용자 등록) 탐색·등록·후기
  - 지역 축제·문화행사 탐색 및 한국관광공사 콘텐츠 동기화·관리자 게시
  - 동네 소상공인 홍보 게시물 탐색 및 등록(사업자 인증 필요)
  - 여행 기록(방문 지역·날짜·사진·스티커 꾸미기)과 대한민국 지도 위 시각화
  - 카카오/네이버 소셜 로그인, 코스·행사·소상공인 통합 마이페이지(내가 쓴 글, 좋아요, 리뷰)
  - 관리자 전용 콘텐츠 관리(코스·행사 등록/수정/삭제, 관광공사 콘텐츠 동기화·검수)

---

## 주요 기능

실제 코드(`src/pages`, `src/hooks`, `src/apis`)에 구현되어 있는 기능만 정리했습니다.

### 사용자 기능

- **회원가입 / 로그인**: 이메일(이메일 인증코드 확인 후 가입) / 카카오 OAuth / 네이버 OAuth 3가지 방식 지원. 소셜 로그인은 신규 사용자면 프로필 완성 화면(`/signup/kakao`, `/signup/naver`)으로 이동합니다. 비밀번호 찾기(이메일 인증 → 재설정)도 지원합니다.
- **로그인 유도 모달**: 비로그인 상태로 좋아요·리뷰 작성 등 인증이 필요한 동작을 하면 즉시 로그인 페이지로 보내는 대신 로그인 유도 모달을 띄웁니다.
- **마이페이지**: 프로필 조회/수정(닉네임·지역·출생연도·프로필 사진), 인증된 소상공인 목록 확인, 회원 탈퇴.
- **내가 등록한 게시물(`/my-posts`)**: 내가 쓴 코스·리뷰·(사업자라면) 홍보 게시물을 한 화면에서 검색·정렬해서 보고 수정/삭제.
- **좋아요(`/likes`)**: 코스·행사·장소(소상공인) 좋아요 목록을 카테고리별로 모아보고, 거리순 정렬(현재 위치 기반) 및 해제.
- **리뷰**: 코스에 별점+사진+텍스트 리뷰 작성(`/review`), 코스 상세의 리뷰 미리보기/전체보기(`/yeogido-course/detail/:id/reviews` 등), 사이트 전체 최근 리뷰 피드(`/recent-review-courses`), 리뷰 수정/삭제.
- **검색**: 코스·행사 각각의 검색 페이지, 지역 검색(`/course-region-search`)에서 최근 검색어·인기 지역 제안.
- **지역 탐색(`/region-info/:region`)**: 지역별 추천 코스(공식/우리동네), 진행 중인 행사, 리뷰를 모아 보여주는 지역 허브 페이지.
- **온보딩**: 첫 방문 시 4장짜리 슬라이드 모달로 추천 코스/우리동네 코스/여행 기록/지도 기능을 소개("다시 보지 않기" 지원).

### 코스 (여기도 추천 코스 / 우리동네 추천 코스)

- **탐색**: `/yeogido-course`(공식)와 `/local-course`(사용자 등록) 각각 홈·인기·최신·검색 화면 제공. 이동수단(도보/자차)·기간(당일치기~3박 이상)·동행(혼자/친구/연인/가족/반려동물)·정렬(추천순·인기순·최신순·저장순·후기순·거리순) 필터를 URL 쿼리에 유지하며 무한 스크롤로 조회.
- **상세**: 코스 대표 이미지, 코스 정보 배지(기간/이동수단/동행), 코스 소개, 방문 순서대로 이어진 카카오맵 경로, 정류지 목록(장소+행사 혼합, 각 정류지 영업시간과 이전 정류지로부터의 이동 시간 자동차/대중교통 표시), 리뷰 미리보기, 좋아요/공유/수정(작성자·관리자).
- **등록**: 우리동네 코스는 일반 로그인 사용자가 지역 선택 → 기본정보 → 대표사진/키워드 → 행사 추가(선택) → 장소 추가(사진 필수) → 방문 순서 드래그 정렬(dnd-kit) 순으로 등록하며, 방문 순서를 기준으로 카카오 정적 지도 위에 경로선+장소 사진 마커를 합성한 코스 대표 이미지를 자동 생성합니다. 여기도(공식) 코스는 관리자가 동일한 흐름을 `/admin/course-registration/**`에서 진행합니다.
- **수정/삭제/좋아요**: 작성자 본인(우리동네) 또는 관리자(여기도)가 등록 마법사로 재진입해 수정, 확인 다이얼로그를 거쳐 삭제, 목록 어디서든 좋아요 토글 가능.

### 문화콘텐츠 / 행사

- **탐색**: `/festival` 홈(배너, 진행 중 행사·최근 본 행사 미리보기), `/festival/ongoing`(진행 중), `/festival/recent`(최근 본), `/festival/search`(키워드/지역 검색). 카테고리(체험/전시/공연/축제)·정렬(추천순/저장순/거리순/종료임박순) 필터.
- **상세**: 행사 소개, 주소·기간·연락처·홈페이지, 카카오맵, 행사 장소 카드(영업시간·좋아요·길찾기), 이 행사가 포함된 코스 미리보기 및 전체보기(`/festival/detail/:id/courses`), 공유·좋아요·관리자 수정/삭제.
- **관리자 행사 등록**: `/admin/event-registration/**`에서 장소 선택 → 기본정보(기간·연락처·홈페이지) → 대표사진/키워드/카테고리 순으로 등록·수정.
- **한국관광공사 콘텐츠 동기화 및 승인·게시**: 관리자 홈(`/admin`)에서 "지금 동기화" 버튼으로 관광공사 문화콘텐츠를 동기화하면 신규 콘텐츠가 `PENDING` 상태로 저장되고, "검토 대기 콘텐츠" 목록에서 제목·설명·카테고리·해시태그·추천 우선순위를 검수/수정해 게시(`PUBLISHED`)할 수 있습니다.

### 소상공인

- **탐색(`/local-business`)**: 전국/지역별 소상공인 홍보 게시물을 지역 캐러셀·카테고리 칩·정렬·그리드/리스트 보기로 탐색, 좋아요 및 작성자 본인 수정/삭제.
- **상세(`/local-business/detail/:id`)**: 사진 캐러셀, 소개글, 주소·영업시간·연락처·SNS, 카카오맵, 좋아요/공유.
- **홍보 게시물 등록/수정**: 사업자 인증(`/business-verification`, 사업자등록증 업로드 + 국세청 진위 확인으로 `BUSINESS` 권한 획득)을 마친 사용자만 `/business-promotion-registration`에서 보유 사업장 선택 → 소개·영업시간·연락처 입력 → 사진/키워드/카테고리 등록 순으로 게시물을 만들고 수정할 수 있습니다.

### 지도 / 여행 기록

- **대한민국 지역 지도**: D3(d3-geo/d3-selection/d3-zoom) 기반 커스텀 SVG 지도로 시/도·시/군/구 경계와 독도를 그리고 확대/축소·클릭 상호작용을 제공하며(`src/pages/home/map`), 홈 화면과 여행 기록의 "여행 지도" 탭에서 재사용됩니다.
- **여행 기록**: `/travel-record`에서 "여행 폴더"(연도 필터 그리드)와 "여행 지도"(지역별 방문 사진 마커) 두 보기 전환. 기록 작성은 지역 선택 → 날짜 선택 → 사진 업로드 → 스티커로 폴더 커버 꾸미기(최대 10개, 카테고리별 스티커 + 커스텀 스티커 업로드) 순의 4단계이며, 동일한 화면으로 수정도 가능합니다. 상세 화면은 사진을 스와이프로 넘겨보고 수정/삭제할 수 있습니다.
- **길찾기/이동시간**: 코스·행사·장소 상세에서 카카오맵 길찾기 딥링크 연결, 코스 정류지 간 자동차(카카오모빌리티)·대중교통(ODsay) 이동 시간을 함께 표시합니다.

### 관리자

- **관리자 로그인/권한**: 일반 로그인 후 서버가 내려주는 역할(`role: ADMIN`)로 관리자 전용 라우트(`AdminRoute`)에 접근할 수 있고, 관리자 전용 사이드바 메뉴가 노출됩니다.
- **콘텐츠 관리**: 진행 중/최근 행사 및 인기/최근 코스를 관리자 화면(`/admin`, `/admin/festivals/*`, `/admin/courses/*`)에서 그리드로 보고 바로 수정/삭제.
- **추천코스·추천행사 등록**: `/admin/course-registration/**`, `/admin/event-registration/**` 다단계 마법사로 공식 코스·행사를 신규 등록/수정(코스는 방문 순서 기반 지도 경로 이미지 자동 생성 포함).
- **한국관광공사 콘텐츠 동기화 및 승인/게시**: 위 "문화콘텐츠 / 행사" 항목 참고 — 동기화·검토 대기 목록·게시가 모두 관리자 홈에서 이뤄집니다.

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

- 프로젝트 기본 구조 관리, 라우팅 설정
- 공통 레이아웃 및 공통 UI 컴포넌트 구현
- 홈 화면(지도/행사/코스/리뷰/광고 섹션, 온보딩) 구현
- 전역 UI 상태(토스트 등) 관리

담당 파일:

```txt
pages/home
components/common
components/layout
components/ui
components/toast
router
styles
```

### B. 인증 + 유저 + 기록

담당자: 윤선민

담당 업무:

- 로그인(이메일/카카오/네이버), 회원가입, 비밀번호 찾기
- 프로필 조회/수정, 마이페이지
- 여행 기록(폴더 생성·수정, 스티커 꾸미기) 목록/상세

담당 파일:

```txt
pages/auth
pages/profile
pages/travel-record
components/auth
components/sticker
store/auth.store.ts
store/travelRecordSession.store.ts
apis/auth.api.ts
apis/users.api.ts
apis/travelRecords.api.ts
apis/stickers.api.ts
```

### C. 장소 탐색 + 검색 + 필터 + 지도

담당자: 이경준

담당 업무:

- 소상공인 탐색/상세/홍보 게시물 등록, 사업자 인증
- 지역 검색, 지역 정보(지역 허브) 페이지
- 카카오맵 연동, 지오코딩·이동시간(카카오모빌리티/ODsay) 조회

담당 파일:

```txt
pages/local-business
pages/business-promotion-registration
pages/business-verification
pages/course-region-search
pages/region-info
components/kakaomap
apis/business-promotions.api.ts
apis/regions.api.ts
apis/kakaoGeocode.ts
apis/kakaoRouteDuration.ts
apis/odsayTransitDuration.ts
apis/googlePlacesHours.ts
apis/googlePlacesPhoto.ts
```

### D. 코스/장소 상세 + 코스 등록

담당자: 이준혁

담당 업무:

- 코스(여기도/우리동네)·행사 목록, 상세, 등록/수정/삭제
- 리뷰 작성/조회, 좋아요, 내가 등록한 게시물
- 관리자 전용 콘텐츠 관리 및 한국관광공사 콘텐츠 동기화·게시

담당 파일:

```txt
pages/yeogido-course
pages/local-course
pages/local-recommendation
pages/festival
pages/detail
pages/review
pages/likes
pages/my-posts
pages/admin
apis/courses.api.ts
apis/localRecommendations.ts
apis/contents.api.ts
apis/tourContents.api.ts
apis/reviews.api.ts
apis/likes.api.ts
```

---

## 기술 스택

**코어**

- React 19 / TypeScript / Vite
- React Router DOM v7 (라우팅)
- Tailwind CSS v4 (스타일링, `@tailwindcss/vite` 플러그인)

**상태/데이터**

- Zustand (클라이언트 전역 상태)
- TanStack React Query (서버 상태·캐싱)
- Axios (HTTP 클라이언트, 인증 인터셉터 포함)
- React Hook Form + Zod (폼 상태/유효성 검증)

**UI/인터랙션**

- react-icons (아이콘)
- motion (애니메이션)
- react-modal-sheet (바텀 시트)
- @dnd-kit/core, @dnd-kit/sortable (드래그앤드롭 — 코스 방문 순서 정렬, 스티커 배치)
- d3-geo, d3-selection, d3-zoom (대한민국 지도 시각화)
- immer (불변 상태 업데이트 보조)

**지도/외부 API 연동**

- Kakao Maps JavaScript SDK, Kakao 로컬/모빌리티 REST API (지도, 지오코딩, 길찾기)
- Google Places API (영업시간·사진 조회)
- ODsay 대중교통 API (대중교통 소요시간)
- Vercel Serverless Functions (`api/`) — 위 REST API 키를 서버에서만 보관하고 프록시

**인증**

- 카카오/네이버 OAuth SDK, jwt-decode

**품질/도구**

- ESLint, Prettier(+ prettier-plugin-tailwindcss), Stylelint
- Node.js 내장 테스트 러너(`node --test`)
- pnpm
- Vercel (배포)

---

## 프로젝트 구조

실제 `src` 디렉토리 구성을 기준으로 작성했습니다. 각 `pages/*` 하위는 대부분 `index.tsx`(진입점) + `components/`(페이지 전용 컴포넌트) + `hooks/`(페이지 전용 훅) 구조를 따릅니다.

```text
📦 (repo root)
┣ 📂 api                           # Vercel 서버리스 함수 — 카카오맵/카카오모빌리티/카카오로컬/구글플레이스/ODsay 프록시(REST 키를 서버에서만 보관)
┣ 📂 tests                         # node:test 기반 유닛 테스트 (60여 개, utils/mapper/hook 로직 중심)
┗ 📂 src
  ┣ 📂 apis                        # 도메인별 API 함수
  ┃ ┣ 📂 common                    # 공용 axios 인스턴스, 응답 언랩/에러 정규화, 토큰 재발급 인터셉터
  ┃ ┣ 📜 auth.api.ts / users.api.ts
  ┃ ┣ 📜 courses.api.ts / localRecommendations.ts   # 코스 조회/등록/수정/삭제
  ┃ ┣ 📜 contents.api.ts / tourContents.api.ts       # 행사(문화콘텐츠) 조회/등록/게시, 관광공사 동기화
  ┃ ┣ 📜 business-promotions.api.ts                  # 소상공인 홍보 게시물
  ┃ ┣ 📜 travelRecords.api.ts / stickers.api.ts       # 여행 기록, 스티커
  ┃ ┣ 📜 reviews.api.ts / likes.api.ts / regions.api.ts / hashtags.ts / files.api.ts
  ┃ ┗ 📜 kakaoGeocode.ts / kakaoRouteDuration.ts / googlePlacesHours.ts / googlePlacesPhoto.ts / odsayTransitDuration.ts
  ┃
  ┣ 📂 pages                       # 라우트 단위 페이지
  ┃ ┣ 📂 home                      # 홈(지도/행사/코스/리뷰/광고 섹션, 온보딩), 대한민국 D3 지도(home/map)
  ┃ ┣ 📂 auth                      # 로그인/회원가입(이메일·카카오·네이버)/비밀번호 찾기
  ┃ ┣ 📂 yeogido-course            # 여기도(공식) 추천 코스 목록/인기/최신/검색
  ┃ ┣ 📂 local-course              # 우리동네(사용자 등록) 추천 코스 목록/인기/최신/검색
  ┃ ┣ 📂 local-recommendation      # 우리동네 코스 등록 마법사(지역→기본정보→사진/키워드→행사→장소→방문순서)
  ┃ ┣ 📂 festival                  # 행사 목록/진행중/최근/검색
  ┃ ┣ 📂 detail                    # 코스·행사·소상공인 상세 화면 및 공용 상세 컴포넌트(CourseDetailLayout 등)
  ┃ ┣ 📂 local-business            # 소상공인 목록
  ┃ ┣ 📂 business-promotion-registration  # 소상공인 홍보 게시물 등록/수정 마법사
  ┃ ┣ 📂 business-verification     # 사업자 인증
  ┃ ┣ 📂 travel-record             # 여행 기록 목록/작성(지역→날짜→사진→스티커 꾸미기)/상세/수정
  ┃ ┣ 📂 review                    # 리뷰 작성
  ┃ ┣ 📂 course-reviews            # 코스별 리뷰 전체 목록
  ┃ ┣ 📂 recent-review-courses     # 사이트 전체 최근 리뷰 피드
  ┃ ┣ 📂 likes                     # 좋아요한 코스/행사/장소 목록
  ┃ ┣ 📂 my-posts                  # 내가 등록한 게시물(코스/리뷰/홍보글)
  ┃ ┣ 📂 profile                   # 마이페이지(조회/수정)
  ┃ ┣ 📂 region-info                # 지역 허브(지역별 코스/행사/리뷰)
  ┃ ┣ 📂 course-region-search      # 지역 검색
  ┃ ┣ 📂 admin                     # 관리자 홈(관광공사 동기화·검수), 코스/행사 등록 마법사, 관리용 목록
  ┃ ┗ 📂 not-found                 # 404 페이지
  ┃
  ┣ 📂 components                  # 여러 페이지에서 공통으로 쓰는 컴포넌트
  ┃ ┣ 📂 common                    # 카드/스켈레톤/모달/필터바/검색바 등 범용 UI
  ┃ ┣ 📂 layout                    # MainLayout, AuthLayout, Header, Sidebar/AuthSidebar, ResponsivePageShell
  ┃ ┣ 📂 ui                        # 최소 공통 요소(Divider 등)
  ┃ ┣ 📂 kakaomap                  # 카카오맵 SDK 래퍼(BaseKakaoMap), 지도 링크/유틸
  ┃ ┣ 📂 auth                      # ProtectedRoute/AdminRoute/BusinessRoute, 로그인 폼 입력 요소
  ┃ ┣ 📂 toast                     # 전역 토스트
  ┃ ┣ 📂 sticker                   # 여행 기록 스티커 렌더링
  ┃ ┗ 📂 region-selection          # 지역 선택 공용 레이아웃
  ┃
  ┣ 📂 hooks                       # 도메인별 React Query 훅, 좋아요 토글, 지도 스케일 등 공통 훅
  ┣ 📂 store                       # Zustand 전역 상태(auth, 코스/행사 등록 드래프트, 여행기록 세션)
  ┣ 📂 contexts                    # 로그인 유도 모달 Context
  ┣ 📂 types                       # 도메인별 TypeScript 타입
  ┣ 📂 constants                   # 지역/태그/뱃지/필터 옵션 등 정적 데이터
  ┣ 📂 utils                       # 인증/이미지/날짜/포맷팅 등 공통 유틸
  ┣ 📂 styles                      # 전역 스타일, Tailwind 테마
  ┗ 📂 router                      # AppRouter(전체 라우트 정의)
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

- `main`, `develop` 직접 push 금지
- 개인 이름 브랜치 사용 금지
- 기능 단위로 브랜치 생성
- PR 전 `develop` 최신 반영

---

## 커밋 컨벤션

형식:

```txt
type: 작업 내용
```

타입:

| 타입 | 설명 |
| :---: | :--- |
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

Node.js 24.x 버전이 필요합니다(`package.json`의 `engines.node` 기준).

환경 변수 설정(`.env.example`을 참고해 `.env` 생성):

```bash
cp .env.example .env
```

```txt
VITE_API_BASE_URL        백엔드 API 베이스 URL
VITE_KAKAO_MAP_API_KEY    카카오맵 JavaScript SDK 키(클라이언트에 노출됨)
KAKAO_REST_API_KEY        카카오 REST API 키(지오코딩/길찾기/정적지도, 서버 프록시 전용)
VITE_NAVER_CLIENT_ID      네이버 로그인 클라이언트 ID
GOOGLE_MAPS_API_KEY       구글 플레이스 API 키(영업시간/사진 조회, 서버 프록시 전용)
ODSAY_API_KEY             ODsay 대중교통 API 키(서버 프록시 전용)
```

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

테스트:

```bash
pnpm test
```

프리뷰:

```bash
pnpm preview
```

---

## 화면 목록 및 플로우

주요 라우트(`src/router/AppRouter.tsx` 기준):

```txt
/                                       홈
/login, /signup, /forgot-password       로그인/회원가입/비밀번호 찾기
/signup/kakao, /signup/naver            소셜 로그인 프로필 완성
/auth/kakao/callback, /auth/naver/callback  소셜 로그인 콜백

/yeogido-course(/popular|/recent|/search)   여기도(공식) 추천 코스
/local-course(/popular|/recent|/search)     우리동네(사용자 등록) 추천 코스
/yeogido-course/detail/:courseId            여기도 코스 상세
/local-course/detail/:courseId              우리동네 코스 상세
/yeogido-course/detail/:courseId/reviews,
/local-course/detail/:courseId/reviews      코스 리뷰 전체 목록

/festival(/ongoing|/recent|/search)         행사 목록
/festival/detail/:festivalId                행사 상세
/festival/detail/:festivalId/courses        이 행사가 포함된 코스 전체 목록

/local-business                             소상공인 목록
/local-business/detail/:id                  소상공인 상세
/business-promotion-registration[/:id/edit] 홍보 게시물 등록/수정 (사업자 전용)
/business-verification                      사업자 인증

/local-recommendation/**                    우리동네 코스 등록 마법사
/travel-record, /travel-record/:folderId    여행 기록 목록/상세
/travel-record/new, /travel-record/date-selection,
/travel-record/photo-selection, /travel-record/folder-decoration           여행 기록 작성 단계(각 단계에 대응하는 /travel-record/:id/edit/* 수정 라우트도 있음)
/review                                     리뷰 작성
/recent-review-courses                      사이트 전체 최근 리뷰
/likes                                      좋아요 목록
/my-posts                                   내가 등록한 게시물
/profile, /profile/edit                     마이페이지 조회/수정
/region-info/:region                        지역 허브
/course-region-search                       지역 검색

/admin                                      관리자 홈(관광공사 동기화/검수)
/admin/courses, /admin/courses/popular,
/admin/courses/recent, /admin/courses/detail/:courseId                     관리자 코스 관리
/admin/festivals/ongoing, /admin/festivals/recent                          관리자 행사 관리
/admin/course-registration/**               관리자 코스 등록 마법사
/admin/event-registration/**                관리자 행사 등록 마법사
```

플로우:

```txt
인증:
홈 -> 로그인 -> (이메일/카카오/네이버) -> 신규 사용자면 프로필 완성 -> 홈

코스 조회:
홈/코스 목록 -> 필터·검색 -> 코스 상세(경로 지도·정류지·리뷰) -> 좋아요/리뷰 작성/공유

우리동네 코스 등록:
코스 등록 -> 지역 선택 -> 기본정보 입력 -> 대표사진/키워드 -> 행사 추가(선택) -> 장소 추가(사진 포함)
          -> 방문 순서 드래그 정렬(경로 이미지 자동 생성) -> 등록 완료 -> 코스 상세로 이동

행사 탐색:
홈/행사 목록 -> 필터·검색 -> 행사 상세(지도·장소카드) -> 포함된 코스 보기 -> 좋아요/공유

소상공인:
소상공인 목록 -> 지역/카테고리 탐색 -> 상세(지도·영업시간) -> (사업자 인증 완료 시) 홍보 게시물 등록/수정

여행 기록:
마이페이지/홈 -> 여행 기록 -> 지역 선택 -> 날짜 선택 -> 사진 업로드 -> 스티커로 폴더 꾸미기 -> 기록 완료
                          -> 여행 지도 탭에서 지역별 방문 기록 확인

관리자 콘텐츠 관리:
관리자 홈 -> 관광공사 콘텐츠 동기화 -> 검토 대기 콘텐츠 확인/수정 -> 게시
관리자 홈 -> 코스/행사 등록 마법사 -> 등록 -> 목록에서 수정/삭제
```

---

## 상태 관리 기준

```txt
Zustand
  클라이언트 전역/세션 상태 관리
  auth.store.ts                 로그인 토큰, 사용자 정보, 인증 세대(auth generation)
  localRecommendation.store.ts  우리동네 코스 등록 마법사 드래프트
  adminCourseRegistration.store.ts  관리자 코스 등록 마법사 드래프트
  adminEventRegistration.store.ts   관리자 행사 등록 마법사 드래프트
  travelRecordSession.store.ts      여행 기록 작성/수정 세션, 목록 탭 상태

React Query
  서버 상태 관리(도메인별 훅으로 캡슐화)
  코스 목록/상세/좋아요 (useCourses, useCourseLikeToggle 등)
  행사(문화콘텐츠) 목록/상세/좋아요, 관광공사 동기화·게시 (useCultureContents, useTourContentSync, useContentPublish 등)
  소상공인 목록/상세 (useBusinessPromotions, useBusinessPromotionDetail)
  여행 기록, 스티커 (useTravelRecords, useStickers)
  리뷰, 좋아요 목록 (useReviews, 좋아요 관련 훅)
  지역 정보, 사용자 프로필 (useRegions, useMyProfile)
```

```txt
Zustand = 여러 화면(주로 다단계 마법사)에 걸쳐 유지해야 하는 클라이언트 전용 상태
React Query = 서버에서 받아오는 데이터와 그 캐싱/재검증
```
