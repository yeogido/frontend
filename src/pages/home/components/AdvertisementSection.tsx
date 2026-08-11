import { useEffect, useRef, useState } from 'react';

import {
  AdvertisementCard,
  AdvertisementCardSkeleton,
} from '../../../components/common';

import { useGlobalScale } from '../../../hooks/useGlobalScale';
import {
  getHomeCarouselIndex,
  HOME_CAROUSEL_CARD_GAP,
} from '../utils/homeCarouselLayout';

// Figma 390 디자인 기준 리터럴 px
const SECTION_MARGIN_TOP = 32;
const SECTION_MARGIN_BOTTOM = 24;
const SECTION_PADDING_X = 24;

const DOT_BOTTOM = 6;
const DOT_GAP = 4;
const DOT_SIZE = 4;
const DOT_ACTIVE_WIDTH = 20;
const DOT_RADIUS = 100;

const banners = [
  {
    id: 1,
    image: '',
    titleWhite: '무료로 전국 여행하는 법',
    titleOrangeBold: '여행지원금',
    titleOrangeRegular: ' 총정리',
  },
  {
    id: 2,
    image: '',
    titleWhite: '숨은 명소를 찾는 법',
    titleOrangeBold: '로컬 큐레이션',
    titleOrangeRegular: ' 무료 체험',
  },
  {
    id: 3,
    image: '',
    titleWhite: '여기도와 함께하는',
    titleOrangeBold: '가을 여행',
    titleOrangeRegular: ' 특가 이벤트',
  },
];

function AdvertisementSection() {
  const isLoading = false;
  // const isLoading = true; // 스켈레톤 확인용

  const scale = useGlobalScale();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    let rafId: number;

    const updateActiveIndex = () => {
      cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const itemWidth = container.clientWidth;

        if (itemWidth === 0) {
          return;
        }

        setActiveIndex(
          getHomeCarouselIndex(
            container.scrollLeft,
            itemWidth,
            scale,
            banners.length,
          ),
        );
      });
    };

    updateActiveIndex();
    container.addEventListener('scroll', updateActiveIndex);

    return () => {
      container.removeEventListener('scroll', updateActiveIndex);
      cancelAnimationFrame(rafId);
    };
  }, [scale]);

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      left:
        (container.clientWidth + HOME_CAROUSEL_CARD_GAP * scale) * index,
      behavior: 'smooth',
    });
  };

  return (
    <section
      style={{
        marginTop: SECTION_MARGIN_TOP * scale,
        marginBottom: SECTION_MARGIN_BOTTOM * scale,
        paddingLeft: SECTION_PADDING_X * scale,
        paddingRight: SECTION_PADDING_X * scale,
      }}
    >
      {/* 스크롤 컨테이너와 점을 같은 relative 기준 안에 두어,
          점이 카드 위에 겹쳐 보이면서도 스와이프와 무관하게 고정되게 한다. */}
      <div className="relative">
        {/* Carousel: 카드 1개가 화면을 꽉 채우며 스와이프로 다음 카드로 스냅 이동 */}
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
          style={{ gap: HOME_CAROUSEL_CARD_GAP * scale }}
        >
          {isLoading ? (
            <div className="w-full shrink-0 snap-start snap-always">
              <AdvertisementCardSkeleton />
            </div>
          ) : (
            banners.map((banner) => (
              <div
                key={banner.id}
                className="w-full shrink-0 snap-start snap-always"
              >
                <AdvertisementCard
                  image={banner.image}
                  titleWhite={banner.titleWhite}
                  titleOrangeBold={banner.titleOrangeBold}
                  titleOrangeRegular={banner.titleOrangeRegular}
                />
              </div>
            ))
          )}
        </div>

        {/* Pagination dots: 카드 위에 겹쳐지는 별도 레이어라
            스와이프 중에도 화면상 같은 자리에 고정되어 보인다. */}
        {!isLoading && banners.length > 1 && (
          <div
            className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center"
            style={{ bottom: DOT_BOTTOM * scale, gap: DOT_GAP * scale }}
          >
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`${index + 1}번째 광고로 이동`}
                aria-current={index === activeIndex}
                onClick={() => scrollToIndex(index)}
                className="pointer-events-auto shrink-0"
                style={{
                  width:
                    (index === activeIndex ? DOT_ACTIVE_WIDTH : DOT_SIZE) *
                    scale,
                  height: DOT_SIZE * scale,
                  borderRadius: DOT_RADIUS,
                  backgroundColor:
                    index === activeIndex ? '#FF6F41' : '#A1A1A1',
                  transition:
                    'width 0.2s ease, background-color 0.2s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AdvertisementSection;
