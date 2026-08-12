import { z } from 'zod';

export const courseBasicInfoSchema = z
  .object({
    courseName: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    duration: z.enum([
      'day-trip',
      '1-night-2-days',
      '2-nights-3-days',
      '3-nights-or-more',
    ]),
    visitStartMonth: z.enum([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
    ]),
    visitEndMonth: z.enum([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
    ]),
    // 'public'(대중교통)은 더 이상 백엔드가 받지 않는 값이라(코스 생성/수정
    // 요청 스펙의 transportType enum이 WALK/CAR만 허용) 뺐다 — '뚜벅이'
    // 옵션이 이미 "대중교통과 도보로 이동"으로 대중교통을 포함한다.
    transport: z.enum(['walking', 'car']),
    companion: z.enum(['solo', 'friends', 'couple', 'family', 'pet']),
  })
  .refine(
    (values) => Number(values.visitStartMonth) <= Number(values.visitEndMonth),
    {
      message: '종료월은 시작월보다 빠를 수 없어요.',
      path: ['visitEndMonth'],
    }
  );

export type CourseBasicInfoValues = z.infer<typeof courseBasicInfoSchema>;
