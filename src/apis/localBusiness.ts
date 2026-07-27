import businessImage from '../pages/local-business/assets/cafe.png';

import type {
  BusinessCategory,
  BusinessItem,
  BusinessSort,
} from '../pages/local-business/types';

interface LocalBusinessQuery {
  category: BusinessCategory;
  sortBy: BusinessSort;
}

export const localBusinessMockData: BusinessItem[] = [
  {
    id: '1',
    title: '웨이브온 카페',
    description:
      '부산 바다를 담은 공간, 웨이브온 카페에 오신걸 환영합니다! 신선한 원두와 정성 가득한 디저트로 기다릴게요 :)',
    location: '부산광역시',
    category: '카페',
    author: '강릉 소상공인 A',
    date: '2026.05.22',
    image: businessImage,
    tags: ['summer', 'sea', 'cafe'],
    recommendationScore: 6,
    savedCount: 128,
    reviewCount: 36,
  },
  {
    id: '2',
    title: '웨이브온 카페',
    description:
      '부산 바다를 담은 공간, 웨이브온 카페에 오신걸 환영합니다! 신선한 원두와 정성 가득한 디저트로 기다릴게요 :)',
    location: '부산광역시',
    category: '맛집',
    author: '강릉 소상공인 A',
    date: '2026.05.22',
    image: businessImage,
    tags: ['summer', 'sea', 'cafe'],
    recommendationScore: 4,
    savedCount: 104,
    reviewCount: 48,
  },
  {
    id: '3',
    title: '웨이브온 카페',
    description:
      '부산 바다를 담은 공간, 웨이브온 카페에 오신걸 환영합니다! 신선한 원두와 정성 가득한 디저트로 기다릴게요 :)',
    location: '부산광역시',
    category: '베이커리',
    author: '강릉 소상공인 A',
    date: '2026.05.22',
    image: businessImage,
    tags: ['summer', 'sea', 'cafe'],
    recommendationScore: 5,
    savedCount: 96,
    reviewCount: 24,
  },
  {
    id: '4',
    title: '웨이브온 카페',
    description:
      '부산 바다를 담은 공간, 웨이브온 카페에 오신걸 환영합니다! 신선한 원두와 정성 가득한 디저트로 기다릴게요 :)',
    location: '부산광역시',
    category: '체험',
    author: '강릉 소상공인 A',
    date: '2026.05.22',
    image: businessImage,
    tags: ['summer', 'sea', 'cafe'],
    recommendationScore: 3,
    savedCount: 87,
    reviewCount: 19,
  },
  {
    id: '5',
    title: '웨이브온 카페',
    description:
      '부산 바다를 담은 공간, 웨이브온 카페에 오신걸 환영합니다! 신선한 원두와 정성 가득한 디저트로 기다릴게요 :)',
    location: '부산광역시',
    category: '전시',
    author: '강릉 소상공인 A',
    date: '2026.05.22',
    image: businessImage,
    tags: ['summer', 'sea', 'cafe'],
    recommendationScore: 2,
    savedCount: 79,
    reviewCount: 13,
  },
  {
    id: '6',
    title: '웨이브온 카페',
    description:
      '부산 바다를 담은 공간, 웨이브온 카페에 오신걸 환영합니다! 신선한 원두와 정성 가득한 디저트로 기다릴게요 :)',
    location: '부산광역시',
    category: '카페',
    author: '강릉 소상공인 A',
    date: '2026.05.22',
    image: businessImage,
    tags: ['summer', 'sea', 'cafe'],
    recommendationScore: 1,
    savedCount: 74,
    reviewCount: 8,
  },
];

function sortLocalBusinesses(
  businesses: BusinessItem[],
  sortBy: BusinessSort,
) {
  return [...businesses].sort((left, right) => {
    if (sortBy === '저장순') {
      return right.savedCount - left.savedCount;
    }

    return right.recommendationScore - left.recommendationScore;
  });
}

export function createLocalBusinessItems({
  category,
  sortBy,
}: LocalBusinessQuery) {
  const filtered =
    category === '전체'
      ? localBusinessMockData
      : localBusinessMockData.filter(
          (business) => business.category === category,
        );

  return sortLocalBusinesses(filtered, sortBy);
}

export async function fetchLocalBusinesses({
  category,
  sortBy,
}: LocalBusinessQuery) {
  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });

  return createLocalBusinessItems({ category, sortBy });
}
