import { useNavigate, useSearchParams } from 'react-router-dom';

import { DesktopPageShell } from '../../../components/layout/desktop';
import DesktopFilterDropdown from '../../../components/layout/desktop/DesktopFilterDropdown';
import { useContentLikeToggle } from '../../../hooks/useContentLikeToggle';
import { useCourseLikeToggle } from '../../../hooks/useCourseLikeToggle';
import { useRecentCourses } from '../../../hooks/useRecentCourses';
import { useRecentCultureContents } from '../../../hooks/useRecentCultureContents';
import { toContentTagIds } from '../../../utils/contentTags';
import { toCourseCardProps } from '../../../utils/courseCard';
import {
  buildCourseDetailPath,
  buildFestivalDetailPath,
} from '../../../utils/routes';
import HomeCourseCard from '../../home/desktop/HomeCourseCard';

// Figma 1440 데스크톱 시안(6456:48320) 기준 리터럴 px.
const CONTENT_WIDTH = 1048;
const TITLE_OFFSET_TOP = 60;

const CATEGORY_OPTIONS = ['전체', '코스', '행사', '장소'] as const;
type RecentCategory = (typeof CATEGORY_OPTIONS)[number];

function isRecentCategory(value: string | null): value is RecentCategory {
  return CATEGORY_OPTIONS.some((option) => option === value);
}

/**
 * 최근 본 게시물 — 상세 화면을 열었을 때 저장해 둔 코스·행사를 4열로 보여준다.
 * 목록은 브라우저(localStorage)에 있어서 이 기기·이 계정에서 본 것만 나온다.
 *
 * 장소(소상공인)는 상세를 열 때 기록하지 않아 지금은 항상 비어 있다.
 * 코스·행사 기록에는 본 시각이 없어, '전체'는 코스 다음에 행사 순으로 보여준다.
 */
function RecentViewedDesktopPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const category: RecentCategory = isRecentCategory(categoryParam)
    ? categoryParam
    : '전체';

  const recentCourses = useRecentCourses();
  const recentContents = useRecentCultureContents();
  const { getLiked: getCourseLiked, toggleLike: toggleCourseLike } =
    useCourseLikeToggle();
  const { getLiked: getContentLiked, toggleLike: toggleContentLike } =
    useContentLikeToggle();

  const showCourses = category === '전체' || category === '코스';
  const showContents = category === '전체' || category === '행사';
  const courses = showCourses ? recentCourses : [];
  const contents = showContents ? recentContents : [];
  const isEmpty = courses.length === 0 && contents.length === 0;

  const handleCategoryChange = (next: RecentCategory) => {
    const nextParams = new URLSearchParams(searchParams);

    if (next === '전체') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', next);
    }

    setSearchParams(nextParams, { replace: true });
  };

  return (
    <DesktopPageShell contentWidth={CONTENT_WIDTH}>
      <div
        style={{ paddingTop: TITLE_OFFSET_TOP }}
        className="flex flex-col gap-[32px]"
      >
        <header className="flex flex-col gap-[6px]">
          <h1 className="text-[32px] leading-[38px] font-semibold text-black">
            최근 본 게시물
          </h1>
          <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
            최근 확인한 게시물을 다시 둘러보세요
          </p>
        </header>

        <div className="flex">
          <DesktopFilterDropdown
            label="분류"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={handleCategoryChange}
          />
        </div>

        {isEmpty ? (
          <p
            role="status"
            className="text-gray-4 py-[48px] text-center text-[16px] font-medium"
          >
            {category === '장소'
              ? '최근 본 장소는 아직 지원하지 않아요.'
              : '최근 본 게시물이 없습니다.'}
          </p>
        ) : (
          <ul className="grid grid-cols-4 gap-x-[24px] gap-y-[48px]">
            {courses.map((recentCourse) => {
              const course = toCourseCardProps(recentCourse);

              return (
                <li key={`course-${course.id}`}>
                  <HomeCourseCard
                    image={course.image}
                    title={course.title}
                    duration={course.duration}
                    courseType={course.courseType}
                    companion={course.companion}
                    tags={course.tags}
                    liked={getCourseLiked(course.id, course.liked)}
                    onClick={() =>
                      navigate(
                        buildCourseDetailPath(
                          recentCourse.courseType,
                          course.id
                        )
                      )
                    }
                    onLikeClick={() =>
                      toggleCourseLike(
                        course.id,
                        getCourseLiked(course.id, course.liked)
                      )
                    }
                  />
                </li>
              );
            })}
            {contents.map((content) => (
              <li key={`content-${content.contentId}`}>
                <HomeCourseCard
                  image={content.thumbnailImageUrl || null}
                  title={content.title}
                  duration={`${content.startDate} ~ ${content.endDate}`}
                  courseType={content.regionName}
                  companion=""
                  tags={toContentTagIds(content.hashtags)}
                  liked={getContentLiked(content.contentId, content.liked)}
                  onClick={() =>
                    navigate(buildFestivalDetailPath(content.contentId))
                  }
                  onLikeClick={() =>
                    toggleContentLike(
                      content.contentId,
                      getContentLiked(content.contentId, content.liked)
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </DesktopPageShell>
  );
}

export default RecentViewedDesktopPage;
