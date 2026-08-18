import { z } from 'zod';

import {
  NICKNAME_LENGTH_ERROR_MESSAGE,
  NICKNAME_MAX_LENGTH,
  NICKNAME_MIN_LENGTH,
} from '../../../utils/nickname.ts';

export const SIGNUP_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 백엔드 검증 규칙과 동일: 영문 + 숫자 + 특수문자를 모두 포함한 8~20자.
// 불필요한 API 호출/에러(COMMON4001)를 줄이기 위해 프론트에서 먼저 막는다.
export const SIGNUP_PASSWORD_PATTERN =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(NICKNAME_MIN_LENGTH, NICKNAME_LENGTH_ERROR_MESSAGE)
      .max(NICKNAME_MAX_LENGTH, NICKNAME_LENGTH_ERROR_MESSAGE),
    email: z
      .string()
      .trim()
      .regex(SIGNUP_EMAIL_PATTERN, '이메일 형식이 올바르지 않습니다.'),
    password: z
      .string()
      .regex(
        SIGNUP_PASSWORD_PATTERN,
        '영문, 숫자, 특수문자를 모두 포함해 8~20자로 입력해 주세요.',
      ),
    passwordConfirm: z
      .string()
      .refine(
        (value) => value.trim().length > 0,
        '비밀번호 확인을 입력해 주세요.',
      ),
    // useRegions()가 내려주는 숫자 regionId를 select value(문자열)로 담는다.
    regionId: z
      .string()
      .trim()
      .refine((value) => Number(value) > 0, '거주 중인 지역을 선택해 주세요.'),
    gender: z.string().trim().min(1, '성별을 선택해 주세요.'),
    birthYear: z
      .string()
      .regex(/^\d{4}$/, '태어난 연도를 선택해 주세요.'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
