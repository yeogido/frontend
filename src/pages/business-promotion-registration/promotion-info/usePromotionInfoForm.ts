import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  DAY_OF_WEEK_VALUES,
  promotionInfoSchema,
  TIME_PATTERN,
  toPromotionInfoResult,
  type DayOfWeek,
  type PromotionInfoFormValues,
  type PromotionInfoResult,
} from './schema';

export interface UsePromotionInfoFormParams {
  onNext: (values: PromotionInfoResult) => void | Promise<void>;
  defaultValues?: Partial<PromotionInfoFormValues>;
  /**
   * 아직 제출 전인 입력값이 바뀔 때마다 호출된다. 뒤로가기로 이 폼이
   * 언마운트됐다가 다시 마운트될 때 defaultValues로 되돌려주기 위해
   * 상위(오케스트레이터)가 진행 중인 값을 계속 들고 있을 수 있게 한다.
   */
  onValuesChange?: (values: PromotionInfoFormValues) => void;
}

/** 모바일 폼과 데스크톱 폼이 함께 쓰는 입력 상태·검증·제출 로직. */
export function usePromotionInfoForm({
  onNext,
  defaultValues,
  onValuesChange,
}: UsePromotionInfoFormParams) {
  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<PromotionInfoFormValues>({
    resolver: zodResolver(promotionInfoSchema),
    mode: 'onChange',
    defaultValues: {
      shortDescription: '',
      openDays: [],
      dayTimes: {},
      phoneNumber: '',
      snsAccount: '',
      ...defaultValues,
    },
  });

  const openDays = useWatch({ control, name: 'openDays' });
  const dayTimes = useWatch({ control, name: 'dayTimes' });
  const shortDescription = useWatch({ control, name: 'shortDescription' });
  const phoneNumber = useWatch({ control, name: 'phoneNumber' });
  const snsAccount = useWatch({ control, name: 'snsAccount' });

  // watch()가 콜백으로 주는 값은 DeepPartial이라, 그걸 그대로
  // PromotionInfoFormValues로 단언해 버리면 상위(오케스트레이터)의
  // defaultValues에 부분 값이 그대로 저장됐다가 재마운트 시 openDays 등
  // 필수 필드가 undefined인 채로 주입될 위험이 있다(openDays.every() 등에서
  // 런타임 에러). 이미 위에서 각 필드를 개별적으로 useWatch해 정확한
  // 타입으로 갖고 있으니, 그 값들로 직접 완전한 객체를 만들어 넘긴다.
  useEffect(() => {
    onValuesChange?.({
      shortDescription,
      openDays,
      dayTimes,
      phoneNumber,
      snsAccount,
    });
  }, [
    onValuesChange,
    shortDescription,
    openDays,
    dayTimes,
    phoneNumber,
    snsAccount,
  ]);

  const dayTimeErrorMessageByDay: Partial<Record<DayOfWeek, string>> = {};
  DAY_OF_WEEK_VALUES.forEach((day) => {
    // openTime이 비었을 때 나는 메시지를 우선 보여주고, 그게 없으면
    // closeTime 메시지를 보여준다 — 한 요일당 에러 문구는 하나만 표시한다.
    const message =
      errors.dayTimes?.[day]?.openTime?.message ??
      errors.dayTimes?.[day]?.closeTime?.message;
    if (message) dayTimeErrorMessageByDay[day] = message;
  });

  // 제출 버튼 활성화 조건을 zod 스키마와 별개로 직접 계산한다(4단계
  // PhotoTagSelectionScreen의 isReady와 같은 패턴). 필수 필드(사업장 소개,
  // 전화번호)와, "선택된" 요일들의 시작/종료 시간만 검사하고
  // SNS 계정과 선택 안 한 요일의 값은 아예 보지 않는다.
  const isDayHoursReady = openDays.every((day) => {
    const hour = dayTimes[day];
    return (
      hour?.openTime &&
      hour?.closeTime &&
      TIME_PATTERN.test(hour.openTime) &&
      TIME_PATTERN.test(hour.closeTime)
    );
  });

  const isReady =
    shortDescription.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    openDays.length > 0 &&
    isDayHoursReady;

  const handleValid = (values: PromotionInfoFormValues) =>
    onNext(toPromotionInfoResult(values));

  return {
    register,
    control,
    submitForm: handleSubmit(handleValid),
    openDays,
    dayTimes,
    shortDescription,
    dayTimeErrorMessageByDay,
    isReady,
    isSubmitting,
  };
}
