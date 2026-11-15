import { useNavigate } from 'react-router-dom';

import {
  DesktopFooter,
  DesktopHeader,
} from '../../../components/layout/desktop';
import { useCourseLikeToggle } from '../../../hooks/useCourseLikeToggle';
import { useCourses } from '../../../hooks/useCourses';
import { toCourseCardProps } from '../../../utils/courseCard';
import { buildCourseDetailPath } from '../../../utils/routes';
import FeaturedCourseCarousel from './FeaturedCourseCarousel';
import HomeAdBanner from './HomeAdBanner';
import HomeFestivalSection from './HomeFestivalSection';
import HomeLocalCourseSection from './HomeLocalCourseSection';
import HomeRegionStrip from './HomeRegionStrip';
import HomeReviewSection from './HomeReviewSection';
import HomeSectionHeader from './HomeSectionHeader';

// Figma 1440 데스크톱 시안(5659-3810) 기준 리터럴 px.
const CONTENT_WIDTH = 1048;
const FEATURED_COUNT = 5;

/** 데스크톱 홈 — 추천 코스 캐러셀, 지역, 행사, 우리동네 코스, 후기, 배너. */
function HomeDesktopPage() {
  const navigate = useNavigate();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { data } = useCourses({
    courseType: 'OFFICIAL',
    sort: 'RECOMMEND',
    size: FEATURED_COUNT,
  });
  const featured = (data?.pages[0]?.items ?? [])
    .slice(0, FEATURED_COUNT)
    .map(toCourseCardProps)
    .map((course) => ({ ...course, liked: getLiked(course.id, course.liked) }));

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-white">
      <DesktopHeader />

      <main className="flex flex-1 flex-col pt-[48px]">
        <div
          style={{ width: CONTENT_WIDTH }}
          className="mx-auto flex flex-col gap-[64px] pb-[64px]"
        >
          {featured.length > 0 ? (
            <section
              aria-label="여기도 추천 코스"
              className="flex flex-col gap-[20px]"
            >
              <HomeSectionHeader title="여기도 추천 코스로 지금 떠나보세요" />
              <FeaturedCourseCarousel
                courses={featured}
                onOpen={(id) => navigate(buildCourseDetailPath('OFFICIAL', id))}
                onLikeClick={(id) =>
                  toggleLike(
                    id,
                    featured.find((c) => c.id === id)?.liked ?? false
                  )
                }
              />
            </section>
          ) : null}

          <section aria-label="지역별 여행">
            <HomeRegionStrip
              onSelect={(name) =>
                navigate(`/region-info/${encodeURIComponent(name)}`)
              }
            />
          </section>

          <HomeFestivalSection />
        </div>

        <HomeReviewSection />

        <div className="py-[48px]">
          <HomeAdBanner />
        </div>

        <div style={{ width: CONTENT_WIDTH }} className="mx-auto pb-[64px]">
          <HomeLocalCourseSection />
        </div>
      </main>

      <DesktopFooter />
    </div>
  );
}

export default HomeDesktopPage;
