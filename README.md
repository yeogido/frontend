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
