import type {
  FriendSummary,
  GetFriendsParams,
  GetFriendsResponse,
} from '../types/friend.type';

/**
 * 친구 API 연동 전 목록·검색·삭제 UI 확인용. 새로고침하면 초기화된다.
 * 연동할 때는 useFriends 안의 호출만 API 함수로 바꾸고 이 파일을 지운다.
 *
 * 주소에 ?friendsMock=empty | error | slow를 붙이면 상태별 화면을 볼 수 있다.
 */
const MOCK_SCENARIO_PARAM = 'friendsMock';
const MOCK_DELAY_MS = 400;
const MOCK_SLOW_DELAY_MS = 1500;
// 실제 요청보다 작게 잘라 목데이터 9명으로도 다음 페이지 불러오기를 볼 수 있다.
const MOCK_MAX_PAGE_SIZE = 6;

type MockScenario = 'empty' | 'error' | 'slow';

let mockFriends: FriendSummary[] = [
  {
    userId: 101,
    nickname: '김여기도',
    profileImageUrl: null,
    friendCode: 'ABC91G23',
  },
  {
    userId: 102,
    nickname: '서희연',
    profileImageUrl: null,
    friendCode: 'K7Q2M9XA',
  },
  {
    userId: 103,
    nickname: '이준혁',
    profileImageUrl: null,
    friendCode: 'P3N8W5ZD',
  },
  {
    userId: 104,
    nickname: '김민지',
    profileImageUrl: null,
    friendCode: 'R6T1B4HY',
  },
  {
    userId: 105,
    nickname: '박서연',
    profileImageUrl: null,
    friendCode: 'C9L2V7QE',
  },
  {
    userId: 106,
    nickname: '정수빈',
    profileImageUrl: null,
    friendCode: 'M5X8D3JF',
  },
  {
    userId: 107,
    nickname: '최지우',
    profileImageUrl: null,
    friendCode: 'H2Z6S9KT',
  },
  {
    userId: 108,
    nickname: '김여름',
    profileImageUrl: null,
    friendCode: 'T8W4N1GU',
  },
  {
    userId: 109,
    nickname: '강하늘',
    profileImageUrl: null,
    friendCode: 'Y3F7E5PB',
  },
];

const collator = new Intl.Collator('ko');

function getScenario(): MockScenario | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = new URLSearchParams(window.location.search).get(
    MOCK_SCENARIO_PARAM
  );

  return value === 'empty' || value === 'error' || value === 'slow'
    ? value
    : null;
}

function wait(scenario: MockScenario | null) {
  const delay = scenario === 'slow' ? MOCK_SLOW_DELAY_MS : MOCK_DELAY_MS;

  return new Promise<void>((resolve) => {
    setTimeout(resolve, delay);
  });
}

function createMockError(code: string, message: string) {
  return Object.assign(new Error(message), { code });
}

function compareFriends(
  a: Pick<FriendSummary, 'nickname' | 'userId'>,
  b: Pick<FriendSummary, 'nickname' | 'userId'>
) {
  return collator.compare(a.nickname, b.nickname) || a.userId - b.userId;
}

function matchesKeyword(friend: FriendSummary, keyword: string) {
  const normalized = keyword.trim().toLowerCase();

  return (
    friend.nickname.toLowerCase().includes(normalized) ||
    friend.friendCode.toLowerCase().startsWith(normalized)
  );
}

export async function getMockFriends(
  params: GetFriendsParams = {}
): Promise<GetFriendsResponse> {
  const scenario = getScenario();

  await wait(scenario);

  if (scenario === 'error') {
    throw createMockError(
      'MOCK_FRIENDS_ERROR',
      '친구 목록을 불러오지 못했어요.'
    );
  }

  const {
    keyword,
    cursorNickname,
    cursorId,
    size = MOCK_MAX_PAGE_SIZE,
  } = params;
  const source = scenario === 'empty' ? [] : mockFriends;
  const matched = source
    .filter((friend) => !keyword || matchesKeyword(friend, keyword))
    .sort(compareFriends);

  let startIndex = 0;

  if (cursorNickname !== undefined && cursorId !== undefined) {
    const cursor = { nickname: cursorNickname, userId: cursorId };
    const nextIndex = matched.findIndex(
      (friend) => compareFriends(friend, cursor) > 0
    );

    startIndex = nextIndex === -1 ? matched.length : nextIndex;
  }

  const pageSize = Math.max(1, Math.min(size, MOCK_MAX_PAGE_SIZE));
  const items = matched.slice(startIndex, startIndex + pageSize);
  const lastItem = items[items.length - 1];
  const hasNext = startIndex + items.length < matched.length;

  return {
    items,
    cursorValue: hasNext && lastItem ? lastItem.nickname : null,
    cursorId: hasNext && lastItem ? lastItem.userId : null,
    hasNext,
  };
}

export async function deleteMockFriend(friendUserId: number): Promise<void> {
  const scenario = getScenario();

  await wait(scenario);

  if (scenario === 'error') {
    throw createMockError('MOCK_FRIENDS_ERROR', '친구 삭제에 실패했어요.');
  }

  if (!mockFriends.some((friend) => friend.userId === friendUserId)) {
    throw createMockError('FRIEND4043', '친구 관계가 아니에요.');
  }

  mockFriends = mockFriends.filter((friend) => friend.userId !== friendUserId);
}
