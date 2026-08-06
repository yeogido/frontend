import type { CourseDetailDto } from '../types/courseDetail';

export const courseImage =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80';

export const courseDetailMockData: CourseDetailDto = {
  id: 1,
  title: '강릉 혼자 여행 코스',
  heroImageUrl: courseImage,
  liked: false,
  tags: [
    { id: 1, tagId: 'summer' as const, label: '여름' },
    { id: 2, tagId: 'nature' as const, label: '자연' },
    { id: 3, tagId: 'sea' as const, label: '바다' },
    { id: 4, tagId: 'cafe' as const, label: '카페' },
    { id: 5, tagId: 'experience' as const, label: '체험' },
  ],
  infoBadges: [
    { id: 1, label: '2박 3일', icon: 'calendar' as const },
    { id: 2, label: '뚜벅이 코스', icon: 'walk' as const },
    { id: 3, label: '4월 - 10월', icon: 'calendar' as const },
    { id: 4, label: '혼자', icon: 'solo' as const },
  ],
  overview:
    '바다를 따라 걷고, 감성 가득한 카페와 로컬 맛집을 즐기는\n강릉의 매력을 천천히 느끼는 2박 3일 코스입니다.',
  stops: [
    {
      id: 1,
      order: 1,
      name: '주문진 해변',
      address: '강원특별자치도 강릉시 창해로14번길 28',
      hours: '평일 10:00 - 23:00',
      image: courseImage,
      liked: false,
      latitude: 37.8911,
      longitude: 128.8277,
      transportToNext: '도보 약 30분',
    },
    {
      id: 2,
      order: 2,
      name: '강릉 중앙시장',
      address: '강원특별자치도 강릉시 창해로14번길 28',
      hours: '평일 10:00 - 23:00',
      image: courseImage,
      liked: false,
      latitude: 37.7538,
      longitude: 128.8986,
      transportToNext: '버스 약 30분',
    },
    {
      id: 3,
      order: 3,
      name: '초당 순두부마을',
      address: '강원특별자치도 강릉시 창해로14번길 28',
      hours: '평일 10:00 - 23:00',
      image: courseImage,
      liked: false,
      latitude: 37.7905,
      longitude: 128.9145,
      transportToNext: '버스 약 30분',
    },
  ],
  reviews: [
    {
      id: 1,
      images: ['', '', ''],
      editableImages: [],
      profileImage: courseImage,
      nickname: '민지',
      meta: '20대 여',
      content:
        '지도 동선이 너무 편했어요. 전시 포인트마다 사진 각이 딱 잡혔고, 야경까지 흐름이 좋아서 만족!',
      rating: 5,
    },
    {
      id: 2,
      images: ['', ''],
      editableImages: [],
      profileImage: courseImage,
      nickname: '느린여행자',
      meta: '30대 남',
      content:
        '렌터카 없이 다녀도 부담 없는 코스였어요. 초당에서 점심 먹고 월정리 카페에서 쉬니 딱 좋았습니다.',
      rating: 5,
    },
  ],
};
