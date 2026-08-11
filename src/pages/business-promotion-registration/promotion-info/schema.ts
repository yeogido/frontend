import { z } from 'zod';

export const DAY_OF_WEEK_VALUES = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

export type DayOfWeek = (typeof DAY_OF_WEEK_VALUES)[number];

export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

// openTime/closeTime을 필수(z.string())로 두면, 요일을 고르고 시작 시간만
// 골랐을 때(종료 시간 미선택) 이 shape 검증이 superRefine보다 먼저 실패해
// zod 기본 영문 메시지("Invalid input: expected string, received undefined")가
// 그대로 노출됐다. 여기서는 항상 통과하게 느슨히 두고, "선택된 요일만" 값이
// 있어야 한다는 진짜 검증과 한국어 메시지는 아래 superRefine에서 전담한다.
const dayTimeEntrySchema = z.object({
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

export type DayTimeEntry = z.infer<typeof dayTimeEntrySchema>;

export const promotionInfoSchema = z
  .object({
    shortDescription: z.string().trim().min(1, '사업장 소개를 입력해 주세요.'),
    ownerComment: z.string().trim().min(1, '사장님의 한마디를 입력해 주세요.'),
    openDays: z
      .array(z.enum(DAY_OF_WEEK_VALUES))
      .min(1, '요일을 1개 이상 선택해 주세요.'),
    // 요일마다 시작/종료 시간을 따로 갖는다(디자인 리뷰 반영: "요일을 선택하면
    // 해당 요일의 시작/종료 시간을 입력하고, 선택한 시간은 요일별로 각각
    // 저장"). 선택 해제된 요일의 값이 남아 있어도 무해하다 — 제출 시
    // openDays에 있는 요일만 골라 쓴다(재선택하면 이전에 입력한 시간이
    // 그대로 돌아온다). 선택 안 한 요일은 검증 대상이 아니다.
    //
    // 키 스키마로 z.enum(...)을 쓰면 zod v4가 이 record를 "모든 키가 필수인
    // 객체"로 취급해(v3와 다른 동작) 손대지 않은 요일까지 "expected object,
    // received undefined"로 실패했다. z.string()으로 느슨하게 받아 진짜
    // sparse map으로 두고, 유효한 요일인지는 우리 코드가 항상 DayOfWeek
    // 값으로만 키를 쓰므로 별도 검증 없이 신뢰한다.
    dayTimes: z.record(z.string(), dayTimeEntrySchema),
    phoneNumber: z.string().trim().min(1, '전화번호를 입력해 주세요.'),
    snsAccount: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    // openDays에 없는 요일은 dayTimes에 값이 남아 있어도 절대 검사하지 않는다.
    values.openDays.forEach((day) => {
      const hour = values.dayTimes[day];
      const openTime = hour?.openTime ?? '';
      const closeTime = hour?.closeTime ?? '';
      const isOpenTimeValid = TIME_PATTERN.test(openTime);
      const isCloseTimeValid = TIME_PATTERN.test(closeTime);

      if (!isOpenTimeValid) {
        ctx.addIssue({
          code: 'custom',
          message: '시작 시간을 선택해 주세요.',
          path: ['dayTimes', day, 'openTime'],
        });
      }

      if (!isCloseTimeValid) {
        ctx.addIssue({
          code: 'custom',
          message: '종료 시간을 선택해 주세요.',
          path: ['dayTimes', day, 'closeTime'],
        });
        return;
      }

      if (isOpenTimeValid && openTime >= closeTime) {
        ctx.addIssue({
          code: 'custom',
          message: '마감 시간은 오픈 시간보다 늦어야 해요.',
          path: ['dayTimes', day, 'closeTime'],
        });
      }
    });
  });

export type PromotionInfoFormValues = z.infer<typeof promotionInfoSchema>;

export interface PromotionInfoBusinessHour {
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
}

// business-promotions.api.ts의 BusinessPromotionCreateRequest 중 이 화면이
// 책임지는 필드만 골라낸 모양이다. businessInfoId(장소 선택)·hashtagIds·images·
// promotionCategory(사진/키워드 선택)는 다른 단계에서 채워 최종 합쳐진다.
export interface PromotionInfoResult {
  shortDescription: string;
  ownerComment: string;
  businessHours: PromotionInfoBusinessHour[];
  phoneNumber: string;
  snsAccount?: string;
}

// 요일마다 따로 입력받은 시작/종료 시간을 businessHours 배열로 펼친다.
// superRefine이 openDays에 포함된 요일은 dayTimes에 유효한 시간이 있음을
// 이미 검증했으므로(openTime/closeTime이 스키마상 optional이라도), 여기서는
// non-null 단언으로 그 값을 그대로 옮기기만 한다.
export function toPromotionInfoResult(
  values: PromotionInfoFormValues
): PromotionInfoResult {
  return {
    shortDescription: values.shortDescription,
    ownerComment: values.ownerComment,
    businessHours: values.openDays.map((dayOfWeek) => {
      const hour = values.dayTimes[dayOfWeek];
      return {
        dayOfWeek,
        openTime: hour.openTime!,
        closeTime: hour.closeTime!,
      };
    }),
    phoneNumber: values.phoneNumber,
    snsAccount: values.snsAccount || undefined,
  };
}
