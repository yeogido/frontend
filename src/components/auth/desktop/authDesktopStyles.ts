// Figma 1440 데스크톱 인증 시안 기준 Tailwind 클래스 묶음.
// 입력·버튼은 화면마다 높이·글자 크기만 다르고 나머지는 같다.

const INPUT_BASE =
  'border-gray-2 placeholder:text-gray-4 focus:border-main-5 text-gray-4 block w-full rounded-[12px] border bg-white px-[14px] font-medium outline-none';

/** 로그인 입력 — 높이 56, 글자 16. */
export const AUTH_INPUT_LARGE_CLASS = `${INPUT_BASE} h-[56px] text-[16px]`;

/** 회원가입·비밀번호 찾기 입력 — 높이 46, 글자 12. */
export const AUTH_INPUT_CLASS = `${INPUT_BASE} h-[46px] text-[12px]`;

/** 입력 옆에 붙는 작은 버튼(인증번호 전송·인증하기) — 높이 46, 글자 12. */
export const AUTH_INLINE_BUTTON_CLASS =
  'h-[46px] shrink-0 cursor-pointer rounded-[12px] px-[16px] text-[12px] font-semibold whitespace-nowrap disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-4 enabled:bg-main-5 enabled:text-white';

/** 화면 맨 아래 큰 버튼 — 글자 18, 위아래 16. */
export const AUTH_SUBMIT_BUTTON_CLASS =
  'w-full cursor-pointer rounded-[12px] px-[10px] py-[16px] text-[18px] font-semibold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-4 enabled:bg-main-5 enabled:text-white';

/** 카드 제목 — 글자 32. */
export const AUTH_TITLE_CLASS = 'text-[32px] font-semibold text-black';

/** 필드 아래 안내·상태 문구. */
export const AUTH_MESSAGE_CLASS = 'text-[12px] font-medium';
