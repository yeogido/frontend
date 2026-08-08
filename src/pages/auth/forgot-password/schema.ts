import { z } from 'zod';

import { SIGNUP_PASSWORD_PATTERN } from '../signup/schema';

export const resetPasswordSchema = z
  .object({
    // 백엔드 검증 규칙과 동일: 영문 + 숫자 + 특수문자를 모두 포함한 8~20자.
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
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
