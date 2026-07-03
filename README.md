# 여기도

## 📖 프로젝트 소개
📍 여기도 : 새로운 로컬 트렌드를 만드는 문화 기록 서비스
방문하고 싶은 지역의 이유를 만들고, 경험을 하나의 라이프스타일로 기록해 보세요.

✨ 핵심 기능 및 가치

- 위치 기반 기록: 지도 위에 나만의 문화 및 로컬 경험을 차곡차곡 아카이빙합니다.

- 취향의 공유: 지도 공유를 통해 나의 경험을 알리고 새로운 로컬 트렌드를 형성합니다.

- 경험의 확장: 지역 방문과 문화 소비를 자연스럽게 연결하는 새로운 사용자 경험(UX)을 제공합니다.

## 👥 팀원 및 프론트엔드 역할 분담
| 이름 | 역할 | Github |
| 김태혁 | 공통 기반 + 전체 통합 | [@github](https://github.com/kimtaehyeokkkk) |
| 윤선민 | 인증 + 마이페이지 + 기록 | [@github](https://github.com/yoonsunmindd) |
| 이경준 | 홈 + 장소 탐색 + 검색/필터 | [@github](https://github.com/KJun-2) |
| 이준혁 | 코스/장소 상세 + 코스 등록 | [@github](https://github.com/junehuk) |

## 🛠 기술 스택

### Environment
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339939?style=for-the-badge&logo=Node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

### Development
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![React Router Dom](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)

### State Management & Data Fetching
![Zustand](https://img.shields.io/badge/Zustand-764ABC?style=for-the-badge&logo=zustand&logoColor=white) (with immer)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

### Styling & UI
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Icons](https://img.shields.io/badge/React_Icons-E91E63?style=for-the-badge&logo=react&logoColor=white)

### Form & Validation
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

### Code Quality & Deployment
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

## 📁 폴더 구조
```text
## 📂 폴더 구조 (Directory Structure)

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

## 📝 코딩 컨벤션
### 네이밍 컨벤션
- 상수: SNAKE_CASE

- 컴포넌트 및 interface 타입: PascalCase

- 변수 및 함수: camelCase

- 폴더명: kebab-case

- 페이지 및 API 파일 (app, api 폴더): kebab-case

- 컴포넌트 파일 (components 폴더): PascalCase

- 유틸리티 파일 (lib, utils, hooks 폴더): camelCase

- 이미지 에셋 처리:

  - public 폴더 내 이미지 파일: _(언더바)로 구분 (예: _logo_main.png)

  - 이미지 import 시: PascalCase 사용

## Prettier 설정
```text
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

## 🌿 깃 컨벤션브랜치 전략main / dev / feature 브랜치 전략을 사용합니다.
- 브랜치명 형태: type/#Issue-Number/Content
- 예시: feat/#12/login-page
- 
## 📝 커밋 컨벤션 (Commit Convention)

| 타입 | 설명 |
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

## 이슈 및 PR 제목 작성 규칙
- 이슈 제목: [type] Content
  - 예시: [feat] 로그인 UI 컴포넌트 구현
- PR 제목: [type] #Issue-Number Content1 / Content2 ...
  - 예시: [refactor, style] #23 TaskModal: 마감일 필수 설정 제거 / Card: 카드&댓글 삭제 확인 모달 추가, 제목&내용 공백 검사

## 🚀 실행 방법
```text
Bash

# 1. 의존성 패키지 설치
$ pnpm install

# 2. 로컬 개발 서버 실행
$ pnpm run dev
```

