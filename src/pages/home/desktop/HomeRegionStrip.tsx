import { useLayoutEffect, useRef } from 'react';

import { regionCities } from '../../../constants/regions';
import { regionCityImages } from '../../../constants/regionImages';
import { useMouseDragScroll } from '../../../hooks/useMouseDragScroll';

// 시안의 원 크기를 유지하며 화면 너비에 맞게 온전한 원만 보여준다.
const CIRCLE_SIZE = 128;
const TARGET_GAP = 36;
const SIDE_PADDING = 24;

interface HomeRegionStripProps {
  readonly onSelect: (regionName: string) => void;
}

/** 지역 원형 사진 줄 — 폭을 넘치면 가로로 스크롤하고, 누르면 지역 정보로 간다. */
function HomeRegionStrip({ onSelect }: HomeRegionStripProps) {
  const dragScroll = useMouseDragScroll({ smoothSnap: true });
  const listRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const updateVisibleCount = () => {
      const available = Math.max(0, list.clientWidth - SIDE_PADDING * 2);
      const preferredCount = Math.round(
        (available + TARGET_GAP) / (CIRCLE_SIZE + TARGET_GAP)
      );
      const count = Math.max(
        1,
        Math.min(
          regionCities.length,
          Math.floor(available / CIRCLE_SIZE),
          preferredCount
        )
      );
      list.style.setProperty('--visible-region-count', String(count));
    };
    updateVisibleCount();
    const observer = new ResizeObserver(updateVisibleCount);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);
  return (
    <ul
      {...dragScroll}
      ref={listRef}
      tabIndex={0}
      aria-label="지역 바로가기"
      className="grid cursor-grab snap-x snap-mandatory [scroll-padding-inline:24px] [scrollbar-width:none] auto-cols-[calc(100%/var(--visible-region-count))] grid-flow-col overflow-x-auto px-6 py-1 select-none [--visible-region-count:6] [clip-path:inset(0_24px)] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
    >
      {regionCities.map((city) => (
        <li key={city.id} className="flex snap-start justify-center">
          <button
            type="button"
            onClick={() => onSelect(city.name)}
            aria-label={`${city.name} 지역 정보`}
            style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
            className="bg-gray-2 relative block overflow-hidden rounded-full"
          >
            <img
              src={regionCityImages[city.id]}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-black/20" />
            <span className="relative text-[24px] font-semibold text-white">
              {city.name}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default HomeRegionStrip;
