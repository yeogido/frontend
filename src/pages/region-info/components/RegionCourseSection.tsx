import { useNavigate } from 'react-router-dom';

import {
  CourseCard,
  CourseCardSkeleton,
  SectionHeader,
} from '../../../components/common';

import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useCourses, usePopularCourses } from '../../../hooks/useCourses';
import { useCourseLikeToggle } from '../../../hooks/useCourseLikeToggle';
import { toCourseCardProps } from '../../../utils/courseCard';

const SECTION_MARGIN_TOP = 32;
const SECTION_PADDING_X = 24;
const LIST_MARGIN_TOP = 16;
const CARD_GAP = 16;
const ERROR_MARGIN_TOP = 16;
const ERROR_TEXT_SIZE = 13;
const REGION_COURSE_PREVIEW_COUNT = 2;
const RETRY_BUTTON_FONT_SIZE = 14;
const RETRY_BUTTON_PADDING_X = 16;
const RETRY_BUTTON_PADDING_Y = 8;

interface RegionCourseSectionProps {
  regionName: string;
  regionId?: number;
}

function RegionCourseSection({
  regionName,
  regionId,
}: RegionCourseSectionProps) {
  const scale = useGlobalScale();
  const navigate = useNavigate();
  const { getLiked, toggleLike } = useCourseLikeToggle();

  // regionId를 찾지 못한 지역(예: /regions 목록에 없는 지역)은
  // 인기 코스 API 대신 일반 코스 목록을 지역명 키워드로 검색해 대체한다.
  const hasRegionId = regionId !== undefined;

  const popularQuery = usePopularCourses(
    { courseType: 'OFFICIAL', regionId },
    { enabled: hasRegionId }
  );

  const fallbackQuery = useCourses(
    {
      courseType: 'OFFICIAL',
      keyword: regionName,
      sort: 'RECOMMEND',
      size: REGION_COURSE_PREVIEW_COUNT,
    },
    { enabled: !hasRegionId }
  );

  const isPending = hasRegionId
    ? popularQuery.isPending
    : fallbackQuery.isPending;
  const isError = hasRegionId ? popularQuery.isError : fallbackQuery.isError;
  const refetch = hasRegionId ? popularQuery.refetch : fallbackQuery.refetch;
  const rawCourses = hasRegionId
    ? (popularQuery.data ?? [])
    : (fallbackQuery.data?.pages[0]?.items ?? []);
  const courses = rawCourses
    .slice(0, REGION_COURSE_PREVIEW_COUNT)
    .map(toCourseCardProps);

  return (
    <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
      <div
        style={{
          paddingLeft: SECTION_PADDING_X * scale,
          paddingRight: SECTION_PADDING_X * scale,
        }}
      >
        <SectionHeader
          title={`${regionName}의 인기 코스`}
          actionText="전체보기"
          onActionClick={() =>
            navigate(
              `/yeogido-course/search?${new URLSearchParams({ region: regionName }).toString()}`
            )
          }
        />
      </div>

      <div
        className="flex flex-col"
        style={{
          marginTop: LIST_MARGIN_TOP * scale,
          gap: CARD_GAP * scale,
          paddingLeft: SECTION_PADDING_X * scale,
          paddingRight: SECTION_PADDING_X * scale,
        }}
      >
        {isPending ? (
          <>
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </>
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              {...course}
              liked={getLiked(course.id, course.liked)}
              onClick={() => navigate(`/yeogido-course/detail/${course.id}`)}
              onLikeClick={() =>
                toggleLike(course.id, getLiked(course.id, course.liked))
              }
            />
          ))
        )}
      </div>

      {!isPending && isError ? (
        <div
          className="flex flex-col items-center"
          style={{
            marginTop: ERROR_MARGIN_TOP * scale,
            gap: ERROR_MARGIN_TOP * scale,
            paddingLeft: SECTION_PADDING_X * scale,
            paddingRight: SECTION_PADDING_X * scale,
          }}
        >
          <p
            className="text-main-5 text-center font-medium"
            style={{ fontSize: ERROR_TEXT_SIZE * scale }}
          >
            코스를 불러오지 못했어요.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-full border border-[#e4e4e4] font-medium text-[#505050]"
            style={{
              fontSize: RETRY_BUTTON_FONT_SIZE * scale,
              paddingLeft: RETRY_BUTTON_PADDING_X * scale,
              paddingRight: RETRY_BUTTON_PADDING_X * scale,
              paddingTop: RETRY_BUTTON_PADDING_Y * scale,
              paddingBottom: RETRY_BUTTON_PADDING_Y * scale,
            }}
          >
            다시 시도
          </button>
        </div>
      ) : null}

      {!isPending && !isError && courses.length === 0 ? (
        <p
          className="text-gray-4 text-center font-medium"
          style={{
            marginTop: ERROR_MARGIN_TOP * scale,
            fontSize: ERROR_TEXT_SIZE * scale,
          }}
        >
          등록된 코스가 없습니다.
        </p>
      ) : null}
    </section>
  );
}

export default RegionCourseSection;
