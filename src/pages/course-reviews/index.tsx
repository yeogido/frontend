import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { ReviewCard } from '../../components/common';
import { ResponsivePageShell } from '../../components/layout';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { ReviewButton } from '../detail/components';
import type { CourseReview } from '../detail/types/courseDetail';

import CourseReviewSortDropdown from './CourseReviewSortDropdown';
import { getCourseReviewList } from './courseReviewData';
import type { CourseReviewType } from './courseReviewRoute';
import type { CourseReviewSort } from './courseReviewSort';

const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 17;
const FILTER_MARGIN_TOP = 11;
const LIST_MARGIN_TOP = 12;
const LIST_GAP = 16;
const REVIEW_BUTTON_MARGIN_TOP = 24;

interface CourseReviewListLocationState {
  courseTitle?: string;
  reviews?: readonly CourseReview[];
}

function CourseReviewsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const [sort, setSort] = useState<CourseReviewSort>('latest');
  const { courseTitle = '', reviews = [] } =
    (location.state as CourseReviewListLocationState | null) ?? {};
  const courseType: CourseReviewType = location.pathname.startsWith(
    '/local-course/'
  )
    ? 'local-course'
    : 'yeogido-course';
  const displayReviews = getCourseReviewList(reviews);
  const sortedReviews = useMemo(
    () =>
      sort === 'rating'
        ? [...displayReviews].sort(
            (first, second) => second.rating - first.rating
          )
        : displayReviews,
    [displayReviews, sort]
  );

  return (
    <ResponsivePageShell
      mode="main-layout"
      topPadding={PAGE_PADDING_TOP}
      bottomPadding={PAGE_PADDING_BOTTOM}
      className="bg-[#F9F9F9]"
    >
      <section className="flex flex-col">
        <div>
          <h1
            className="font-semibold text-[#1C1C1C]"
            style={{
              fontSize: TITLE_SIZE * scale,
              lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
            }}
          >
            코스 후기
          </h1>
          <p
            className="font-normal text-[#505050]"
            style={{
              marginTop: DESCRIPTION_MARGIN_TOP * scale,
              fontSize: DESCRIPTION_SIZE * scale,
              lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
            }}
          >
            {courseTitle
              ? `${courseTitle}를 다녀온 여행자들의 후기를 확인해 보세요.`
              : '이 코스를 다녀온 여행자들의 후기를 확인해 보세요.'}
          </p>
        </div>
        <div
          className="flex justify-end"
          style={{ marginTop: FILTER_MARGIN_TOP * scale }}
        >
          <CourseReviewSortDropdown value={sort} onChange={setSort} />
        </div>
        <div
          className="flex flex-col"
          style={{ marginTop: LIST_MARGIN_TOP * scale, gap: LIST_GAP * scale }}
        >
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              images={review.images}
              profileImage={review.profileImage}
              nickname={review.nickname}
              meta={review.meta}
              content={review.content}
              rating={review.rating}
              isMine={review.isMine}
              className="[&>div>article]:!bg-[#F1F1F1]"
            />
          ))}
        </div>
        <div style={{ marginTop: REVIEW_BUTTON_MARGIN_TOP * scale }}>
          <ReviewButton
            onClick={() =>
              courseId && navigate(`/review?type=${courseType}&id=${courseId}`)
            }
          />
        </div>
      </section>
    </ResponsivePageShell>
  );
}

export default CourseReviewsPage;
