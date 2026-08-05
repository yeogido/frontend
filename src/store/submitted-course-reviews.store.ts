import { create } from 'zustand';

import type { CourseReview } from '../pages/detail/types/courseDetail';

export type SubmittedCourseReviewType = 'yeogido-course' | 'local-course';

export interface SubmittedCourseReviewInput {
  readonly courseType: SubmittedCourseReviewType;
  readonly courseId: string | number;
  readonly images: string[];
  readonly content: string;
  readonly rating: number;
}

interface SubmittedCourseReviewsState {
  readonly reviewsByCourse: Readonly<Record<string, readonly CourseReview[]>>;
  addReview: (input: SubmittedCourseReviewInput) => void;
}

export function getSubmittedCourseReviewKey(
  courseType: SubmittedCourseReviewType,
  courseId: string | number
) {
  return `${courseType}:${courseId}`;
}

export const useSubmittedCourseReviewsStore = create<SubmittedCourseReviewsState>(
  (set) => ({
    reviewsByCourse: {},
    addReview: ({ courseType, courseId, images, content, rating }) => {
      const key = getSubmittedCourseReviewKey(courseType, courseId);
      const review: CourseReview = {
        id: Date.now(),
        images,
        profileImage: '',
        nickname: '나',
        meta: '여행자',
        content,
        rating,
        isMine: true,
      };

      set((state) => ({
        reviewsByCourse: {
          ...state.reviewsByCourse,
          [key]: [review, ...(state.reviewsByCourse[key] ?? [])],
        },
      }));
    },
  })
);
