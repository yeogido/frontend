import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type {
  TravelRecordListResponse,
  TravelRecordMapItem,
} from '../../types/travelRecord.type';
import { FRIEND_TRAVEL_QUERY_PREFIXES } from '../friendQueryKeys.ts';

export interface TravelRecordLeaveSession {
  userId: number;
  authGeneration: number;
}

/** 참여를 종료한 기록을 내 목록에서 제거하고, 자동 PUBLIC 전환 여부는 재조회로 반영한다. */
export async function clearLeftTravelRecordQueries(
  client: QueryClient,
  travelRecordId: number,
  session: TravelRecordLeaveSession,
  isCurrentSession: () => boolean = () => true
): Promise<void> {
  if (!isCurrentSession()) return;
  const listKey = ['travelRecords', session.userId, session.authGeneration];
  const mapKey = ['travelRecordMap', session.userId, session.authGeneration];
  const yearsKey = [
    'travelRecordYears',
    session.userId,
    session.authGeneration,
  ];
  const isDetail = ({ queryKey: key }: { queryKey: readonly unknown[] }) =>
    key[0] === 'travelRecord' &&
    key[1] === travelRecordId &&
    ((key[2] === 'folder' &&
      key[3] === session.userId &&
      key[4] === session.authGeneration) ||
      (key[2] === session.userId && key[3] === session.authGeneration));
  // 친구 여행 데이터에는 참여 여부가 반영된다. 현재 조회자 관점의 결과만 다시 받는다.
  const isFriendTravel = ({
    queryKey: key,
  }: {
    queryKey: readonly unknown[];
  }) =>
    FRIEND_TRAVEL_QUERY_PREFIXES.includes(String(key[0])) &&
    key[1] === session.userId;

  await Promise.all([
    client.cancelQueries({ queryKey: listKey }),
    client.cancelQueries({ queryKey: mapKey }),
    client.cancelQueries({ queryKey: yearsKey }),
    client.cancelQueries({ predicate: isDetail }),
    client.cancelQueries({ predicate: isFriendTravel }),
  ]);
  if (!isCurrentSession()) return;

  client.setQueriesData<InfiniteData<TravelRecordListResponse>>(
    { queryKey: listKey },
    (data) =>
      data
        ? {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.filter(
                (item) => item.travelRecordId !== travelRecordId
              ),
            })),
          }
        : data
  );
  client.setQueriesData<TravelRecordMapItem[]>({ queryKey: mapKey }, (data) =>
    data?.filter((item) => item.travelRecordId !== travelRecordId)
  );
  client.removeQueries({ predicate: isDetail });
  client.removeQueries({ predicate: isFriendTravel });
  void client.invalidateQueries({ queryKey: listKey });
  void client.invalidateQueries({ queryKey: mapKey });
  void client.invalidateQueries({ queryKey: yearsKey });
}
