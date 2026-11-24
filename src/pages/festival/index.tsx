import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SearchTriggerButton } from '../../components/common';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useCultureContentBanners } from '../../hooks/useCultureContentBanners';
import { buildFestivalDetailPath } from '../../utils/routes';

import { FeaturedFestivalBanner } from './components';
import FestivalHomeSections from './components/FestivalHomeSections';
import useFestivalPreviews from './hooks/useFestivalPreviews';
import type { FeaturedFestival } from './types';

const BANNER_ITEM_COUNT = 5;
const BANNER_ROTATE_INTERVAL_MS = 2000;

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 21;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 17;
const SEARCH_MARGIN_TOP = 12;
const BANNER_MARGIN_TOP = 12;

function FestivalPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { featuredFestival } = useFestivalPreviews();

  // 메인 배너: 배너 전용 API(/contents/banner)가 이미 여러 개를 내려줘서
  // 2초마다 자동 전환한다. 목록 API(/contents)는 날짜를 월까지만 내려주게
  // 바뀌었지만 배너 전용 API는 일자까지 그대로 내려준다. 다른 배너들처럼
  // 상위 5개로 명시적으로 제한한다(지금은 API가 5개만 주지만, 응답 개수가
  // 늘어나도 여기서 고정하기 위해).
  const { data: cultureContentBanners } = useCultureContentBanners();
  const bannerFestivals: FeaturedFestival[] = (cultureContentBanners ?? [])
    .slice(0, BANNER_ITEM_COUNT)
    .map((banner) => ({
      id: banner.contentId,
      image: banner.thumbnailImage,
      title: banner.title,
      description: banner.description,
      period: `${banner.startDate} ~ ${banner.endDate}`,
    }));
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    if (bannerFestivals.length <= 1) return;

    const timer = setInterval(() => {
      setBannerIndex(
        (previousIndex) => (previousIndex + 1) % bannerFestivals.length
      );
    }, BANNER_ROTATE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [bannerFestivals.length]);

  const activeBanner = bannerFestivals[bannerIndex % bannerFestivals.length];
  const displayedBanner = activeBanner ?? featuredFestival;

  const goToFestivalSearch = () => {
    navigate('/course-region-search?from=festival');
  };

  return (
    <section
      className="mx-auto flex min-h-screen w-full flex-col"
      style={{
        paddingLeft: PAGE_PADDING_X * scale,
        paddingRight: PAGE_PADDING_X * scale,
        paddingTop: PAGE_PADDING_TOP * scale,
        paddingBottom: PAGE_PADDING_BOTTOM * scale,
      }}
    >
      <div>
        <h1
          className="font-semibold text-black"
          style={{
            fontSize: TITLE_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          어디로 떠나볼까요?
        </h1>
        <p
          className="text-gray-5 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          다양한 지역의 행사를 만나보세요
        </p>
      </div>

      <div style={{ marginTop: SEARCH_MARGIN_TOP * scale }}>
        <SearchTriggerButton
          label="행사명 또는 지역명 검색 화면으로 이동"
          placeholder="행사명 또는 지역명을 검색해 주세요"
          onClick={goToFestivalSearch}
        />
      </div>

      <div style={{ marginTop: BANNER_MARGIN_TOP * scale }}>
        <FeaturedFestivalBanner
          festival={displayedBanner}
          onClick={() =>
            activeBanner
              ? navigate(buildFestivalDetailPath(activeBanner.id))
              : goToFestivalSearch()
          }
        />
      </div>

      <FestivalHomeSections />
    </section>
  );
}

export default FestivalPage;
