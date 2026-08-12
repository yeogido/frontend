export const courseReviewSortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'rating', label: '별점순' },
] as const;

export type CourseReviewSort = (typeof courseReviewSortOptions)[number]['value'];
