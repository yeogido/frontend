import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px.
// pages/home/components/AdvertisementSection.tsx의 스와이프+도트 배너
// 캐러셀 패턴(순수 CSS scroll-snap, 외부 라이브러리 없음)을 그대로 가져와
// 히어로 이미지 여러 장에 맞게 적용했다. 다른 상세 화면(코스·축제)이 쓰는
// 공용 DetailHeroSection은 사진이 늘 1장이라 그대로 두고, 이 컴포넌트는
// local-business 상세 전용으로 분리했다.
const HERO_HEIGHT = 296;
const DOT_BOTTOM = 12;
const DOT_GAP = 4;
const DOT_SIZE = 4;
const DOT_ACTIVE_WIDTH = 20;
const DOT_RADIUS = 100;
// DetailHeroSection의 rightAction 자리와 같은 오프셋(우측 상단 16px).
const ACTION_OFFSET = 16;

interface DetailHeroCarouselProps {
  readonly imageUrls: readonly string[];
  readonly title: string;
  /** 우측 상단에 얹는 액션(좋아요 또는 본인 글이면 수정/삭제 메뉴). */
  readonly rightAction?: ReactNode;
}

function DetailHeroCarousel({
  imageUrls,
  title,
  rightAction,
}: DetailHeroCarouselProps) {
  const scale = useGlobalScale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let rafId: number;

    const handleScroll = () => {
      cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const itemWidth = container.clientWidth;
        if (itemWidth === 0) return;

        setActiveIndex(Math.round(container.scrollLeft / itemWidth));
      });
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollTo({
      left: container.clientWidth * index,
      behavior: 'smooth',
    });
  };

  return (
    <section
      className="bg-gray-2 relative w-full overflow-hidden"
      style={{ height: HERO_HEIGHT * scale }}
    >
      <div
        ref={scrollRef}
        className="flex h-full snap-x snap-mandatory overflow-x-auto scrollbar-hide"
      >
        {imageUrls.map((imageUrl, index) => (
          <img
            key={`${imageUrl}-${index}`}
            src={imageUrl}
            alt={index === 0 ? title : `${title} 사진 ${index + 1}`}
            className="h-full w-full shrink-0 snap-start snap-always object-cover"
          />
        ))}
      </div>

      {rightAction ? (
        <div
          className="absolute z-10 flex items-center justify-center"
          style={{ top: ACTION_OFFSET * scale, right: ACTION_OFFSET * scale }}
        >
          {rightAction}
        </div>
      ) : null}

      {/* 사진이 1장뿐이면 넘길 게 없으니 점을 아예 안 보여준다. */}
      {imageUrls.length > 1 ? (
        <div
          className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center"
          style={{ bottom: DOT_BOTTOM * scale, gap: DOT_GAP * scale }}
        >
          {imageUrls.map((imageUrl, index) => (
            <button
              key={`${imageUrl}-${index}`}
              type="button"
              aria-label={`${index + 1}번째 사진으로 이동`}
              aria-current={index === activeIndex}
              onClick={() => scrollToIndex(index)}
              className="pointer-events-auto shrink-0"
              style={{
                width:
                  (index === activeIndex ? DOT_ACTIVE_WIDTH : DOT_SIZE) *
                  scale,
                height: DOT_SIZE * scale,
                borderRadius: DOT_RADIUS,
                backgroundColor: index === activeIndex ? '#FF6F41' : '#A1A1A1',
                transition: 'width 0.2s ease, background-color 0.2s ease',
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default DetailHeroCarousel;
