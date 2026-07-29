export function buildFestivalDetailPath(festivalId: number | string) {
  return `/festival/detail/${festivalId}`;
}

export function buildCourseSearchPath(keyword: string) {
  const searchParams = new URLSearchParams({ keyword });

  return `/yeogido-course/search?${searchParams.toString()}`;
}

export function buildLocalBusinessDetailPath(businessId: number | string) {
  return `/local-business/detail/${businessId}`;
}
