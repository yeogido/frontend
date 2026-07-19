import lotusFestivalImage from '../assets/lotus-festival.webp';
import watermelonFestivalImage from '../assets/watermelon-festival.webp';
import type { FeaturedFestival, FestivalPreview } from '../types';

export const featuredFestival: FeaturedFestival = {
  id: 1,
  image: lotusFestivalImage,
  title: '부여 서동연꽃축제',
  description:
    '2026년 여름, 사랑과 향기, 역사와 낭만이 함께하는 부여 궁남지에서 잊지 못할 축제',
  period: '2026.07.03 ~ 2026.07.05',
};

export const ongoingFestivalPreviews: FestivalPreview[] = [
  {
    id: 1,
    image: watermelonFestivalImage,
    title: '양평수박축제',
    period: '2026.07 ~ 2026.07',
    location: '경기도 양평군',
    category: 'FESTIVAL',
    tags: ['summer', 'nature', 'experience'],
    liked: false,
  },
  {
    id: 2,
    image: watermelonFestivalImage,
    title: '양평수박축제',
    period: '2026.07 ~ 2026.07',
    location: '경기도 양평군',
    category: 'EXPERIENCE',
    tags: ['summer', 'nature', 'experience'],
    liked: false,
  },
];

export const recentFestivalPreviews: FestivalPreview[] = [
  {
    id: 101,
    image: watermelonFestivalImage,
    title: '양평수박축제',
    period: '2026.07 ~ 2026.07',
    location: '경기도 양평군',
    category: 'FESTIVAL',
    tags: ['summer', 'nature', 'experience'],
    liked: false,
  },
  {
    id: 102,
    image: watermelonFestivalImage,
    title: '양평수박축제',
    period: '2026.07 ~ 2026.07',
    location: '경기도 양평군',
    category: 'PERFORMANCE',
    tags: ['summer', 'nature', 'experience'],
    liked: false,
  },
];

export const festivalSearchResults: FestivalPreview[] = Array.from(
  { length: 8 },
  (_, index) => ({
    id: 201 + index,
    image: watermelonFestivalImage,
    title: '양평수박축제',
    period: '2026.07 ~ 2026.07',
    location: '경기도 양평군',
    category: ([
      'FESTIVAL',
      'EXPERIENCE',
      'EXHIBITION',
      'PERFORMANCE',
    ] as const)[index % 4],
    tags: ['summer', 'nature', 'experience'],
    liked: false,
  })
);
