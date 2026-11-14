import type {
  FriendRelationStatus,
  FriendSummary,
  SearchedFriend,
} from '../../types/friend.type';

// 훅 파일은 react-query를 import해서 Node 테스트 러너가 읽지 못한다.
// 검색 결과 병합, 캐시 갱신, 다음 페이지 선택만 따로 두어 그대로 검증한다.

/** 친구 코드는 서버와 같게 공백을 없애고 대문자로 바꿔 보낸다. */
export function normalizeFriendCode(input: string): string {
  return input.trim().toUpperCase();
}

interface SearchPage {
  items: SearchedFriend[];
}

/** 검색 페이지를 하나의 목록으로 합친다. 같은 userId는 앞에 나온 것만 남긴다. */
export function getSearchItemsFromPages(
  pages: readonly SearchPage[] | undefined
): SearchedFriend[] {
  const seen = new Set<number>();
  const items: SearchedFriend[] = [];

  for (const page of pages ?? []) {
    for (const item of page.items) {
      if (!seen.has(item.userId)) {
        seen.add(item.userId);
        items.push(item);
      }
    }
  }

  return items;
}

/**
 * 내 친구 결과 뒤에 이어 붙일 새 친구 결과를 고른다. 이미 친구인 사용자(FRIEND)와
 * 친구 목록에 이미 있는 userId는 뺀다. 같은 사람은 친구 목록 쪽이 우선이다.
 */
export function mergeFriendSearchResults(
  friends: readonly Pick<FriendSummary, 'userId'>[],
  searchItems: readonly SearchedFriend[]
): SearchedFriend[] {
  const friendIds = new Set(friends.map((friend) => friend.userId));

  return searchItems.filter(
    (item) => item.relationStatus !== 'FRIEND' && !friendIds.has(item.userId)
  );
}

export interface SearchRelationPatch {
  relationStatus: FriendRelationStatus;
  requestId?: number | null;
}

/**
 * 캐시된 모든 페이지에서 해당 사용자의 관계를 바꾼다. 데이터가 없거나 그
 * 사용자가 없으면 그대로 둔다.
 */
export function updateSearchItemRelation<TData extends { pages: SearchPage[] }>(
  data: TData | undefined,
  userId: number,
  patch: SearchRelationPatch
): TData | undefined {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.userId === userId
          ? {
              ...item,
              relationStatus: patch.relationStatus,
              requestId: patch.requestId ?? null,
            }
          : item
      ),
    })),
  };
}

interface NextPageSourceState {
  friends: {
    isPending: boolean;
    isError: boolean;
    hasNextPage: boolean;
  };
  search: {
    isError: boolean;
    hasNextPage: boolean;
  };
  /** 친구 목록이든 새 친구 검색이든 조회가 하나라도 진행 중인지. */
  isAnyFetching: boolean;
}

export type NextPageSource = 'friends' | 'search' | null;

/**
 * 스크롤 센티널이 다음 페이지를 어느 쪽에서 받을지 정한다. 친구 목록에 다음
 * 페이지가 남아 있으면 친구 쪽, 소진됐으면 새 친구 검색 쪽이다. 어떤 조회든
 * 진행 중이면 받지 않고(같은 커서를 두 번 보내거나, 곧 바뀔 목록 뒤에 이어 붙일
 * 수 있다), 실패한 쪽은 다시 시도 버튼으로만 이어 간다.
 */
export function selectNextPageSource({
  friends,
  search,
  isAnyFetching,
}: NextPageSourceState): NextPageSource {
  if (isAnyFetching || friends.isPending || friends.isError) {
    return null;
  }

  if (friends.hasNextPage) {
    return 'friends';
  }

  return search.hasNextPage && !search.isError ? 'search' : null;
}
