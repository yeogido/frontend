import { useMemo } from 'react';

export interface MappedDataResult<T> {
  readonly data: T | null;
  readonly error: string | null;
}

const DEFAULT_ERROR_MESSAGE = '데이터를 불러오지 못했습니다.';

// ponytail: deps는 호출부에서 넘긴 배열을 그대로 useMemo에 전달한다.
// 정적 리터럴이 아니라 exhaustive-deps 린트가 이 훅 내부에서는 검증하지 못하니,
// 호출부에서 실제 사용하는 값을 빠짐없이 deps에 넣어야 한다.
export function useMappedData<T>(
  mapFn: () => T,
  deps: readonly unknown[],
  fallbackErrorMessage: string = DEFAULT_ERROR_MESSAGE
): MappedDataResult<T> {
  return useMemo<MappedDataResult<T>>(() => {
    try {
      return { data: mapFn(), error: null };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e.message : fallbackErrorMessage,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  }, deps);
}

export default useMappedData;
