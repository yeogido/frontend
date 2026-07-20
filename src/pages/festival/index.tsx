import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  SearchTriggerButton,
  SectionHeader,
} from '../../components/common';

import { FeaturedFestivalBanner } from './components';
import useFestivalPreviews from './hooks/useFestivalPreviews';

function FestivalPage() {
  const navigate = useNavigate();
  const { featuredFestival, ongoingFestivals, recentFestivals } =
    useFestivalPreviews();

  const goToFestivalSearch = () => {
    navigate('/course-region-search?from=festival');
  };

  const goToOngoingFestivals = () => {
    navigate('/festival/ongoing');
  };

  const goToRecentFestivals = () => {
    navigate('/festival/recent');
  };

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-6 pt-3 pb-10">
      <div>
        <h1 className="text-[18px] leading-[21px] font-semibold text-black">
          어디로 떠나볼까요?
        </h1>
        <p className="mt-[6px] text-[14px] leading-[17px] font-normal text-gray-5">
          다양한 지역의 행사를 만나보세요
        </p>
      </div>

      <SearchTriggerButton
        className="mt-3"
        label="행사명 또는 지역명 검색 화면으로 이동"
        placeholder="행사명 또는 지역명을 검색해 주세요"
        onClick={goToFestivalSearch}
      />

      <div className="mt-3">
        <FeaturedFestivalBanner
          festival={featuredFestival}
          onClick={goToFestivalSearch}
        />
      </div>

      <section className="mt-8">
        <SectionHeader
          title="진행 중인 행사"
          actionText="전체 보기"
          onActionClick={goToOngoingFestivals}
        />

        <div className="mt-3 grid grid-cols-2 gap-4">
          {ongoingFestivals.map((festival) => (
            <ContentCard
              key={festival.id}
              image={festival.image}
              title={festival.title}
              firstInfo={festival.period}
              secondInfo={festival.location}
              liked={festival.liked}
              tags={festival.tags}
              className="w-full"
              imageClassName="aspect-[163/115] h-auto"
              onClick={goToFestivalSearch}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader
          title="최근 본 행사"
          actionText="전체 보기"
          onActionClick={goToRecentFestivals}
        />

        <div className="mt-3 grid grid-cols-2 gap-4">
          {recentFestivals.map((festival) => (
            <ContentCard
              key={festival.id}
              image={festival.image}
              title={festival.title}
              firstInfo={festival.period}
              secondInfo={festival.location}
              liked={festival.liked}
              tags={festival.tags}
              className="w-full"
              imageClassName="aspect-[163/115] h-auto"
              onClick={goToFestivalSearch}
            />
          ))}
        </div>
      </section>

    </section>
  );
}

export default FestivalPage;
