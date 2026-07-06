export interface SidebarMenuItem {
  label: string;
  path: string;
}

export const guestSidebarMenu: SidebarMenuItem[] = [
  {
    label: '여기도 추천 코스',
    path: '/course',
  },
  {
    label: '여기도 추천 행사',
    path: '/festival',
  },
  {
    label: '우리동네 추천 코스',
    path: '/local-course',
  },
  {
    label: '지역 소상공인',
    path: '/local-business',
  },
];