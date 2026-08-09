import { toContentTagIds } from './contentTags.ts';
import {
  toCompanionLabel,
  toDurationLabel,
  toReviewerMetaLabel,
  toTransportLabel,
} from './courseEnumLabels.ts';

import type { ReviewDetail, ReviewImage } from '../types/review.type';

// 응답이 순서대로 온다는 보장이 없어 imageOrder로 정렬해 둔다.
function sortImages(images: ReviewImage[] | undefined): ReviewImage[] {
  return [...(images ?? [])].sort((a, b) => a.imageOrder - b.imageOrder);
}

export function toImageUrls(images: ReviewImage[] | undefined): string[] {
  return sortImages(images)
    .map((image) => image.imageUrl)
    .filter(Boolean);
}

/**
 * 수정 화면이 쓰는 사진 목록.
 *
 * 유지할 사진을 PATCH에 다시 실어 보내려면 imageKey가 필요하고, 화면에는
 * imageUrl을 그려야 해서 둘을 함께 넘긴다.
 */
export function toEditableImages(images: ReviewImage[] | undefined) {
  return sortImages(images)
    .filter((image) => image.imageKey && image.imageUrl)
    .map(({ imageKey, imageUrl }) => ({ imageKey, imageUrl }));
}

/** 최근 후기를 ReviewCard props로 바꾼다. */
export function toReviewCardProps(review: ReviewDetail) {
  return {
    id: review.reviewId,
    images: toImageUrls(review.images),
    editableImages: toEditableImages(review.images),
    profileImage: review.author?.profileImageUrl ?? '',
    nickname: review.author?.nickname ?? '',
    meta: toReviewerMetaLabel(review.author?.ageGroup, review.author?.gender),
    content: review.content,
    rating: review.rating,
    isMine: review.isMine,
    courseTitle: review.course.title,
    courseId: review.course.courseId,
    courseType: review.course.courseType,
  };
}

/** 후기 + 코스 정보를 CourseReviewCard props로 바꾼다. */
export function toReviewCourseCardProps(review: ReviewDetail) {
  return {
    id: review.reviewId,
    courseId: review.course.courseId,
    courseType: review.course.courseType,
    isMine: review.isMine,
    // 카드에 그리는 건 코스 썸네일(image)이고, 후기 사진(images)은 카드를 눌러
    // 여는 상세 모달에서 쓴다.
    image: review.course.thumbnailUrl,
    images: toImageUrls(review.images),
    editableImages: toEditableImages(review.images),
    title: review.course.title,
    duration: toDurationLabel(review.course.durationType),
    transport: toTransportLabel(review.course.transportType),
    companion: toCompanionLabel(review.course.companionType),
    tags: toContentTagIds(review.course.tags),
    profileImage: review.author?.profileImageUrl ?? '',
    nickname: review.author?.nickname ?? '',
    meta: toReviewerMetaLabel(review.author?.ageGroup, review.author?.gender),
    content: review.content,
    rating: review.rating,
  };
}
