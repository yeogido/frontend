import { z } from 'zod';

export const courseBasicInfoSchema = z.object({
  courseName: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  duration: z.enum([
    'day-trip',
    '1-night-2-days',
    '2-nights-3-days',
    '3-nights-4-days',
    '4-nights-or-more',
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
  transport: z.enum(['walking', 'car']),
  companion: z.enum(['solo', 'friends', 'couple', 'family', 'children']),
});

export type CourseBasicInfoValues = z.infer<typeof courseBasicInfoSchema>;
