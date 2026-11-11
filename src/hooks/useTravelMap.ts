import { useQueries } from '@tanstack/react-query';
import { getTravelRecordMap } from '../apis/travelRecords.api';
import { useAuthStore } from '../store/auth.store';
import { useAuth } from './useAuth';
import { useTravelRecordYears } from './useTravelRecords';
import { useTravelRecordRegionDetailsState } from './useTravelRecordRegions';
import {
  getUnresolvedTravelMapRegionIds,
  mapTravelMapRecordToFolder,
} from '../pages/travel-record/mappers/travelMapMapper';
import { collectTravelRecords } from '../pages/travel-record/utils/collectTravelRecords';
import {
  getTravelRecordMapRecords,
  getTravelRecordMapYearQueries,
  getTravelRecordMapYears,
  getTravelMapQueryKey,
} from '../pages/travel-record/utils/mapAuth';

const MAP_RECORDS_PAGE_SIZE = 50;

const getAllTravelMapRecordsInYear = (year: number) =>
  collectTravelRecords((cursor) =>
    getTravelRecordMap({ year, size: MAP_RECORDS_PAGE_SIZE, cursor })
  );

/**
 * 지도에 찍을 여행 기록 전체.
 *
 * 지도 API도 year를 생략하면 현재 연도만 돌려주므로 연도별 모든 페이지를
 * 모은다. 사진은 지도 응답을 사용하고, 앨범 상세는 조회하지 않는다.
 *
 * 홈은 로그인 없이 열리는 화면인데 여행 기록 API는 인증이 필요하다. 로그인
 * 전에는 조회를 시작하지 않는다.
 */
export function useTravelMap({ enabled = true } = {}) {
  const { isAuthenticated: hasSession } = useAuth();
  const userId = useAuthStore((state) => state.userId);
  const authGeneration = useAuthStore((state) => state.authGeneration);
  const canFetchMap = hasSession && enabled && userId !== null;
  const travelRecordYearsQuery = useTravelRecordYears({
    enabled: canFetchMap,
  });
  const cachedYears = travelRecordYearsQuery.data?.years;
  const years = getTravelRecordMapYears(canFetchMap, cachedYears);

  const yearQueries = useQueries({
    queries: getTravelRecordMapYearQueries(canFetchMap, years).map(
      ({ year, enabled }) => ({
        queryKey: getTravelMapQueryKey(userId, authGeneration, { year }),
        queryFn: () => getAllTravelMapRecordsInYear(year),
        enabled,
      })
    ),
  });

  const failedYearQueries = yearQueries.filter((query) => query.isError);
  const records = getTravelRecordMapRecords(
    canFetchMap &&
      failedYearQueries.length === 0 &&
      !travelRecordYearsQuery.isError,
    yearQueries.map((query) => query.data ?? [])
  );
  const regionsQuery = useTravelRecordRegionDetailsState(
    getUnresolvedTravelMapRegionIds(records)
  );
  // 비활성 쿼리는 계속 pending으로 남는다. 로그인 전 상태가 로딩이나 실패로
  // 보이지 않도록 인증 여부를 함께 본다.
  const isError =
    canFetchMap &&
    (travelRecordYearsQuery.isError ||
      failedYearQueries.length > 0 ||
      regionsQuery.isError);
  const isPending =
    canFetchMap &&
    (travelRecordYearsQuery.isPending ||
      yearQueries.some((query) => query.isPending) ||
      regionsQuery.isPending);

  return {
    // 한 연도라도 실패하면 나머지 연도만 넘기지 않는다. 일부만 빠진 지도는
    // 그 지역에 다녀온 적이 없는 것처럼 보여서 실패보다 더 오해를 준다.
    records: isError ? [] : records,
    folders: isError
      ? []
      : records.map((record) =>
          mapTravelMapRecordToFolder(
            record,
            regionsQuery.data.get(record.regionId)
          )
        ),
    isPending,
    isError,
    retry: () => {
      if (!canFetchMap) {
        return;
      }

      // 다른 기기의 추가·삭제도 반영하도록 연도 목록과 지도 페이지를 함께 갱신한다.
      void travelRecordYearsQuery.refetch();
      yearQueries.forEach((query) => void query.refetch());
      regionsQuery.retry();
    },
  };
}
