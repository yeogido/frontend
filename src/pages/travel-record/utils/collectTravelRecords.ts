import type {
  TravelRecordListResponse,
  TravelRecordSummary,
} from '../../../types/travelRecord.type';

// apiClient를 import하지 않는다. 페이지를 이어 받는 반복 로직만 담아 Node
// 테스트 러너에서 그대로 검증할 수 있게 한다.
type FetchTravelRecordPage = (
  cursor: number | undefined,
) => Promise<TravelRecordListResponse>;

/**
 * 커서를 따라가며 한 연도의 여행 기록을 전부 모은다.
 *
 * 지도는 페이지 단위가 아니라 전체 기록이 필요해서 끝까지 받아 온다.
 */
export const collectTravelRecords = async (
  fetchPage: FetchTravelRecordPage,
): Promise<TravelRecordSummary[]> => {
  const records: TravelRecordSummary[] = [];
  let cursor: number | undefined;

  do {
    const page = await fetchPage(cursor);

    records.push(...page.items);
    // hasNext가 true여도 커서가 비어 오면 다음 페이지를 요청할 근거가 없다.
    // 그대로 반복하면 같은 페이지를 무한히 받게 되므로 여기서 멈춘다.
    cursor = page.hasNext ? (page.cursorId ?? undefined) : undefined;
  } while (cursor !== undefined);

  return records;
};
