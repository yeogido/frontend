import type { CourseReviewType } from '../../../utils/courseReviewRoute';
import type { CourseDetail } from './courseDetail';

/** 코스 상세 레이아웃(모바일/데스크톱)이 같이 받는 props. */
export interface CourseDetailLayoutProps {
  readonly course: CourseDetail;
  readonly reviewType: CourseReviewType;
  readonly onFavoriteToggle?: (isLiked: boolean) => Promise<boolean>;
  readonly isFavoritePending?: boolean;
  readonly onPlaceLikeToggle?: (
    placeId: number,
    isLiked: boolean,
    courseItemId: number
  ) => Promise<boolean>;
  readonly onContentLikeToggle?: (
    contentId: number,
    isLiked: boolean
  ) => Promise<boolean>;
  readonly pendingPlaceIds?: ReadonlySet<number>;
  readonly pendingContentIds?: ReadonlySet<number>;
  readonly onBack?: () => void;
}
