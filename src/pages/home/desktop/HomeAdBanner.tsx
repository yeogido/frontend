import { useEffect, useState } from 'react';

import { HOME_BANNERS } from '../constants/banners';

// Figma 1440 데스크톱 시안(6093:34684 banner) 기준 리터럴 px.
const BANNER_HEIGHT = 118;
const ROTATE_INTERVAL_MS = 3000;

/**
 * 정부 정책·이벤트 배너 — 전체 폭 띠에 배너가 돌아가며 보이고, 누르면 해당
 * 사업 페이지가 새 탭으로 열린다. 마우스를 올리거나 포커스가 있으면 멈춘다.
 */
function HomeAdBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const banner = HOME_BANNERS[activeIndex];

  useEffect(() => {
    if (isPaused || HOME_BANNERS.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % HOME_BANNERS.length);
    }, ROTATE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <section
      aria-label="정부 정책 및 이벤트"
      style={{ height: BANNER_HEIGHT }}
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <a
        href={banner.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${banner.titleWhite} ${banner.titleOrangeBold}`}
        className="relative block h-full w-full"
      >
        <img
          src={banner.image}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center gap-[12px] bg-black/30 text-[32px] font-semibold"
        >
          <span className="text-white">{banner.titleWhite}</span>
          <span className="text-main-5">{banner.titleOrangeBold}</span>
        </span>
      </a>

      <p
        aria-live="off"
        className="absolute right-[24px] bottom-[12px] rounded-full bg-black/50 px-[10px] py-[2px] text-[12px] text-white"
      >
        {activeIndex + 1} / {HOME_BANNERS.length}
      </p>
    </section>
  );
}

export default HomeAdBanner;
