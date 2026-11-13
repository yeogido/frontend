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
