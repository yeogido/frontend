import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .refine((value) => value.trim().length > 0, '비밀번호를 입력해 주세요.'),
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
