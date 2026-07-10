export type CourseTagIcon = 'beach' | 'nature' | 'magic' | 'food';

export type CourseTagTone =
  | 'green'
  | 'blue'
  | 'sky'
  | 'primary'
  | 'neutral';

export interface CourseTag {
  id: number;
  label: string;
  icon: CourseTagIcon;
  tone: CourseTagTone;
}

export type CourseBadgeIcon = 'calendar' | 'car' | 'bus' | 'people';

export interface CourseInfoBadge {
  id: number;
  label: string;
  icon: CourseBadgeIcon;
}

export interface CourseReview {
  id: number;
  profileImage: string;
  nickname: string;
  meta: string;
  content: string;
  rating: number;
}

export interface CourseStop {
  id: number;
  order: number;
  name: string;
  address: string;
  hours: string;
  image: string;
  transportToNext?: string;
}

export interface LocalCourse {
  title: string;
  heroImageUrl: string;
  tags: CourseTag[];
  infoBadges: CourseInfoBadge[];
  overview: string;
  stops: CourseStop[];
  reviews: CourseReview[];
}
