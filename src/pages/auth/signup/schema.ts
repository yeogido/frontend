import { z } from 'zod';

export const SIGNUP_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, '이름을 입력해 주세요.'),
    email: z
      .string()
      .trim()
      .regex(SIGNUP_EMAIL_PATTERN, '이메일 형식이 올바르지 않습니다.'),
    password: z
      .string()
      .refine((value) => value.trim().length > 0, '비밀번호를 입력해 주세요.'),
    passwordConfirm: z
      .string()
      .refine(
        (value) => value.trim().length > 0,
        '비밀번호 확인을 입력해 주세요.',
      ),
    region: z.string().trim().min(1, '거주 중인 지역을 선택해 주세요.'),
    gender: z.string().trim().min(1, '성별을 선택해 주세요.'),
    birthYear: z.string().trim().min(1, '태어난 연도를 선택해 주세요.'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
