export type FriendProfileTab = 'folder' | 'map' | 'courses';

// 시안(5814:37300) 순서. 폴더와 지도는 아직 내용이 없어 "준비 중이에요"만 보인다.
export const FRIEND_PROFILE_TABS: readonly {
  key: FriendProfileTab;
  label: string;
}[] = [
  { key: 'folder', label: '여행 폴더' },
  { key: 'map', label: '여행 지도' },
  { key: 'courses', label: '우리동네추천코스' },
];

export const DEFAULT_FRIEND_PROFILE_TAB: FriendProfileTab = 'courses';

// 탭과 패널을 aria-controls와 aria-labelledby로 잇는 id. 패널은 한 번에 하나만
// 렌더되므로 탭 키마다 패널 id가 하나씩 있다.
export const getFriendProfileTabId = (tab: FriendProfileTab) =>
  `friend-profile-tab-${tab}`;

export const getFriendProfilePanelId = (tab: FriendProfileTab) =>
  `friend-profile-panel-${tab}`;

// 선택한 탭과 지도 연도는 URL(?tab=, ?year=)에 둬서, 상세에 다녀와도 그대로 돌아온다.
export const FRIEND_PROFILE_TAB_PARAM = 'tab';
export const FRIEND_PROFILE_YEAR_PARAM = 'year';

/** ?tab= 값을 탭으로 바꾼다. 없거나 잘못된 값이면 기본 탭이다. */
export function parseFriendProfileTab(
  value: string | null | undefined
): FriendProfileTab {
  return (
    FRIEND_PROFILE_TABS.find((tab) => tab.key === value)?.key ??
    DEFAULT_FRIEND_PROFILE_TAB
  );
}

/** ?year= 값을 연도로 바꾼다. 양의 정수가 아니면 null(전체)이다. */
export function parseFriendProfileYear(
  value: string | null | undefined
): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const year = Number(value);

  return Number.isSafeInteger(year) ? year : null;
}

/**
 * 탭을 바꾼 쿼리. 기본 탭은 ?tab=을 뺀다. 탭마다 연도의 의미가 달라서 ?year=는
 * 지우고, 그 밖의 파라미터는 그대로 둔다.
 */
export function withFriendProfileTab(
  params: URLSearchParams,
  tab: FriendProfileTab
): URLSearchParams {
  const next = new URLSearchParams(params);

  next.delete(FRIEND_PROFILE_YEAR_PARAM);

  if (tab === DEFAULT_FRIEND_PROFILE_TAB) {
    next.delete(FRIEND_PROFILE_TAB_PARAM);
  } else {
    next.set(FRIEND_PROFILE_TAB_PARAM, tab);
  }

  return next;
}

/** 연도를 바꾼 쿼리. 전체(null)는 ?year=를 빼고 다른 파라미터는 그대로 둔다. */
export function withFriendProfileYear(
  params: URLSearchParams,
  year: number | null
): URLSearchParams {
  const next = new URLSearchParams(params);

  if (year === null) {
    next.delete(FRIEND_PROFILE_YEAR_PARAM);
  } else {
    next.set(FRIEND_PROFILE_YEAR_PARAM, String(year));
  }

  return next;
}
