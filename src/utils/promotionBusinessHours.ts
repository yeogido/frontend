// react-query나 apiClient를 import하지 않는다. 소상공인 홍보글 영업시간 규격과 표시
// 판단만 담아 Node 테스트 러너에서 그대로 검증한다.

/** HH:mm 형식(00:00~23:59). */
export const HOUR_MINUTE_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * 서버 규격의 24시간 영업. 시작과 종료가 같은 값은 거절되지만 00:00~00:00만 예외로
 * 24시간을 뜻한다.
 */
export const ALL_DAY_BUSINESS_HOUR = {
  openTime: '00:00',
  closeTime: '00:00',
} as const;

// 기존 데이터와 구글 플레이스 변환 결과가 쓰는 24시간 표기. operatingHours.ts의
// 판단 함수들이 이 값만 24시간으로 안다.
const LEGACY_ALL_DAY_CLOSE_TIME = '23:59';

interface BusinessHourTimes {
  readonly openTime: string;
  readonly closeTime: string;
}

/** 24시간 영업인지. 서버 규격(00:00~00:00)과 기존 값(00:00~23:59)을 모두 인정한다. */
export function isAllDayBusinessHour(
  openTime: string | undefined,
  closeTime: string | undefined
): boolean {
  return (
    openTime === ALL_DAY_BUSINESS_HOUR.openTime &&
    (closeTime === ALL_DAY_BUSINESS_HOUR.closeTime ||
      closeTime === LEGACY_ALL_DAY_CLOSE_TIME)
  );
}

/**
 * 영업시간 한 칸이 서버가 받는 값인지. 둘 다 HH:mm이어야 하고, 종료가 시작보다
 * 이른 심야 영업(예: 18:00~02:00)은 허용한다. 시작과 종료가 같은 값은 거절되지만
 * 00:00~00:00(24시간)만 예외다.
 */
export function isValidBusinessHourRange(
  openTime: string | undefined,
  closeTime: string | undefined
): boolean {
  if (
    openTime === undefined ||
    closeTime === undefined ||
    !HOUR_MINUTE_PATTERN.test(openTime) ||
    !HOUR_MINUTE_PATTERN.test(closeTime)
  ) {
    return false;
  }

  return (
    openTime !== closeTime ||
    (openTime === ALL_DAY_BUSINESS_HOUR.openTime &&
      closeTime === ALL_DAY_BUSINESS_HOUR.closeTime)
  );
}

/**
 * 서버가 준 영업시간을 operatingHours.ts가 아는 표기로 바꾼다. 24시간(00:00~00:00)은
 * 그쪽의 24시간 표기(00:00~23:59)로 옮기고, 나머지는 그대로 둔다. operatingHours.ts는
 * 여러 화면이 같이 써서 고치지 않고, 이 경계에서 맞춘다.
 */
export function normalizeServerBusinessHour<T extends BusinessHourTimes>(
  hour: T
): T {
  return hour.openTime === ALL_DAY_BUSINESS_HOUR.openTime &&
    hour.closeTime === ALL_DAY_BUSINESS_HOUR.closeTime
    ? { ...hour, closeTime: LEGACY_ALL_DAY_CLOSE_TIME }
    : hour;
}
