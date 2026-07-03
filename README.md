# [프로젝트 이름]

## 📖 프로젝트 소개
(여기에 프로젝트에 대한 간단한 소개, 기획 의도, 주요 타겟층 등을 작성해 주세요.)

## 👥 팀원 및 프론트엔드 역할 분담
| 이름 | 역할 | Github |
| :---: | :--- | :--- |
| **OOO** | (예: 로그인/회원가입 페이지 구현, 전역 상태 관리) | [@github](https://github.com/) |
| **OOO** | (예: 메인 페이지 레이아웃, 공통 UI 컴포넌트 설계) | [@github](https://github.com/) |

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
src/
├── apis/             # API 통신 및 Axios 설정
├── assets/           # 이미지, 아이콘, 폰트
│   ├── fonts/
│   ├── icons/
│   └── images/
├── components/       # 공통 컴포넌트
│   ├── common/
│   ├── layout/
│   └── ui/
├── constants/        # 상수 관리
├── hooks/            # 공통 Custom Hook
├── pages/            # 페이지 단위 컴포넌트
├── router/           # 라우터 설정
│   └── AppRouter.tsx
├── store/            # Zustand 전역 상태 Store
├── styles/           # 전역 스타일
│   └── globals.css
├── types/            # 공통 타입(interface, type)
├── utils/            # 유틸 함수
├── App.tsx
└── main.tsx
```
#📝 코딩 컨벤션
## 네이밍 컨벤션
상수: SNAKE_CASE

컴포넌트 및 interface 타입: PascalCase

변수 및 함수: camelCase

폴더명: kebab-case

페이지 및 API 파일 (app, api 폴더): kebab-case

컴포넌트 파일 (components 폴더): PascalCase

유틸리티 파일 (lib, utils, hooks 폴더): camelCase

이미지 에셋 처리:

public 폴더 내 이미지 파일: _(언더바)로 구분 (예: _logo_main.png)

이미지 import 시: PascalCase 사용

# Prettier 설정
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
# 🌿 깃 컨벤션브랜치 전략main / dev / feature 브랜치 전략을 사용합니다.
- 브랜치명 형태: type/#Issue-Number/Content
- 예시: feat/#12/login-page
## 커밋 / PR 타입
타입설명feat새로운 기능 추가fix버그 수정docs문서 수정style코드 스타일 변경 (코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우 등)design사용자 UI 디자인 변경 (CSS 등)refactor코드 리팩토링test테스트 코드 작성build빌드 파일 수정ciCI 설정 파일 수정perf성능 개선chore빌드 수정, 패키지 매니저 설정, 운영 코드 변경이 없는 경우 등rename파일 혹은 폴더명을 수정한 경우remove파일 삭제만 한 경우
## 이슈 및 PR 제목 작성 규칙
- 이슈 제목: [type] Content
  - 예시: [feat] 로그인 UI 컴포넌트 구현
- PR 제목: [type] #Issue-Number Content1 / Content2 ...
  - 예시: [refactor, style] #23 TaskModal: 마감일 필수 설정 제거 / Card: 카드&댓글 삭제 확인 모달 추가, 제목&내용 공백 검사

# 🚀 실행 방법
```text
Bash

# 1. 의존성 패키지 설치
$ pnpm install

# 2. 로컬 개발 서버 실행
$ pnpm run dev
```

