import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IoCheckmarkCircle, IoEllipseOutline } from 'react-icons/io5';

import closeRounded from '../../../assets/icons/close-rounded.svg';
import mapIcon from '../../../assets/icons/map.svg';
import onboarding1 from '../../../assets/icons/onboarding1.svg';
import onboarding2 from '../../../assets/icons/onboarding2.svg';
import onboarding3 from '../../../assets/icons/onboarding3.svg';
import onboarding4 from '../../../assets/icons/onboarding4.svg';
import sticker1 from '../../../assets/icons/sticker1.svg';
import sticker2 from '../../../assets/icons/sticker2.svg';
import sticker3 from '../../../assets/icons/sticker3.svg';
import sticker4 from '../../../assets/icons/sticker4.svg';
import { MIN_TOUCH_TARGET } from '../../../constants/layout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { dismissOnboardingPermanently } from '../../../utils/onboarding';
import {
  getHomeCarouselIndex,
  HOME_CAROUSEL_CARD_GAP,
} from '../utils/homeCarouselLayout';

// Figma 342x453 카드 기준 리터럴 px. ReviewEditModal과 같은 방식으로
// 바깥 section에만 transform: scale()을 걸고, 안쪽 요소들은 이 리터럴
// 값을 그대로 쓴다 — 안에서 또 scale을 곱하면 이중으로 배율이 적용된다.
const CARD_WIDTH = 342;
const CARD_HEIGHT = 453;
const CARD_RADIUS = 12;
const CLOSE_ICON_INSET = 20;
const CLOSE_ICON_SIZE = 24;
// 아이콘은 20/20에 24x24로 그대로 두고, 탭 영역만 44x44(MIN_TOUCH_TARGET)로
// 넓혀서 아이콘 중심(20+12=32)에 히트박스 중심이 맞도록 안쪽으로 당긴다.
const CLOSE_HIT_AREA_INSET =
  CLOSE_ICON_INSET - (MIN_TOUCH_TARGET - CLOSE_ICON_SIZE) / 2;
const DOT_TOP = 36;
const DOT_SIZE = 4;
const DOT_ACTIVE_WIDTH = 20;
const DOT_GAP = 4;
const TEXT_TOP = 64;
const TEXT_SIDE_PADDING = 24;
const TEXT_GAP = 12;
const TITLE_FONT_SIZE = 20;
const TITLE_LINE_HEIGHT = 24;
const DESCRIPTION_FONT_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 20;
const IMAGE_TOP = 184;
const IMAGE_WIDTH = 248;
const FOOTER_TOP = 402;
const FOOTER_HEIGHT = 51;
const FOOTER_SIDE_PADDING = 24;
const FOOTER_GAP = 8;
const FOOTER_FONT_SIZE = 16;
const CHECK_ICON_SIZE = 16;

interface OnboardingSticker {
  src: string;
  top: number;
  left: number;
  size: number;
  rotate?: number;
}

interface OnboardingSlide {
  id: number;
  title: ReactNode;
  description: string;
  image: string;
  stickers?: OnboardingSticker[];
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: '여기도 가볼까?',
    description:
      '어디로 떠날지 고민된다면,\n추천 코스를 따라 새로운 지역을 여행해 보세요.\n각 지역의 숨은 재미와 새로운 행사를 경험할 수 있어요',
    image: onboarding1,
  },
  {
    id: 2,
    title: '우리 동네 어때?',
    description:
      '나만 아는 우리 동네의 숨은 명소와 맛집을\n코스로 만들어 공유해 보세요.\n누군가의 특별한 여행이 될 수 있어요.',
    image: onboarding2,
  },
  {
    id: 3,
    title: '추억 여기에 담자!',
    description:
      '여행의 순간을 사진과 스티커로 기록하고,\n지역별 여행 폴더로 차곡차곡 모아보세요.\n소중한 추억을 언제든 다시 꺼내볼 수 있어요.',
    image: onboarding3,
    stickers: [
      { src: sticker1, top: 270, left: 73, size: 49 },
      { src: sticker2, top: 281, left: 108, size: 51, rotate: -8.66 },
      { src: sticker3, top: 275, left: 178, size: 47.53, rotate: 15 },
      { src: sticker4, top: 249, left: 233, size: 89 },
    ],
  },
  {
    id: 4,
    title: (
      <span className="inline-flex items-center justify-center gap-1">
        여기, 도
        <img
          src={mapIcon}
          alt=""
          aria-hidden="true"
          className="inline-block h-5 w-5"
        />
        !
      </span>
    ),
    description:
      '나의 추억으로 지도가 채워지고, 다녀온 지역이 하나씩\n기록됩니다. 나만의 여행 여기도를 만들어 보세요.',
    image: onboarding4,
  },
];

interface OnboardingModalProps {
  onClose: () => void;
}

function OnboardingModal({ onClose }: OnboardingModalProps) {
  const scale = Math.min(useGlobalScale(), 1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) dismissOnboardingPermanently();
    onClose();
  };

  // Escape 핸들러가 매번 최신 dontShowAgain을 보되, 이 때문에 아래
  // 키보드/포커스 effect가 매 토글마다 다시 실행되진 않도록 ref로 참조한다.
  // ref 갱신은 렌더 중이 아니라 effect(커밋 이후)에서 한다.
  const handleCloseRef = useRef(handleClose);
  useEffect(() => {
    handleCloseRef.current = handleClose;
  });

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

        // 이 컴포넌트는 바깥 카드에만 transform: scale()을 걸고 gap 등
        // 안쪽 값은 리터럴 px 그대로라, clientWidth/gap 모두 이미
        // 스케일과 무관한 실제 레이아웃 값이다 — scale을 또 곱하면
        // 좁은 화면에서 스냅 지점과 계산이 어긋난다.
        setActiveIndex(
          getHomeCarouselIndex(
            container.scrollLeft,
            itemWidth,
            1,
            slides.length
          )
        );
      });
    };

    updateActiveIndex();
    container.addEventListener('scroll', updateActiveIndex);

    return () => {
      container.removeEventListener('scroll', updateActiveIndex);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // 모달이 떠 있는 동안 배경 스크롤을 막고, 열릴 때 닫기 버튼으로 포커스를
  // 옮겼다가 닫히면 원래 포커스였던 요소로 되돌린다. Esc로도 닫을 수 있게 한다.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleCloseRef.current();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    // 사이드바(z-[60])보다 낮으면, 홈으로 뒤로가기 등으로 이 모달이 다시
    // 뜨는 시점에 사이드바가 아직 닫히는 애니메이션 중이면 사이드바가 이
    // 위에 겹쳐 그려진다 — 온보딩은 항상 최상단에 떠야 하므로 더 높게 둔다.
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="여기도 소개"
        className="relative shrink-0 overflow-hidden shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: CARD_RADIUS,
          background: 'linear-gradient(180deg, #F9F9F9 0%, #939393 100%)',
          transform: `scale(${scale})`,
        }}
      >
        <div
          ref={scrollRef}
          className="scrollbar-hide flex h-full snap-x snap-mandatory overflow-x-auto"
          style={{ gap: HOME_CAROUSEL_CARD_GAP }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="relative h-full w-full shrink-0 snap-start snap-always"
            >
              <div
                className="absolute flex flex-col text-center"
                style={{
                  top: TEXT_TOP,
                  left: TEXT_SIDE_PADDING,
                  right: TEXT_SIDE_PADDING,
                  gap: TEXT_GAP,
                }}
              >
                <h2
                  className="font-bold break-keep text-[#1c1c1c]"
                  style={{
                    fontSize: TITLE_FONT_SIZE,
                    lineHeight: `${TITLE_LINE_HEIGHT}px`,
                  }}
                >
                  {slide.title}
                </h2>
                <p
                  className="font-semibold break-keep whitespace-pre-line text-[#1c1c1c]"
                  style={{
                    fontSize: DESCRIPTION_FONT_SIZE,
                    lineHeight: `${DESCRIPTION_LINE_HEIGHT}px`,
                  }}
                >
                  {slide.description}
                </p>
              </div>

              <img
                src={slide.image}
                alt=""
                aria-hidden="true"
                className="absolute"
                style={{
                  top: IMAGE_TOP,
                  left: (CARD_WIDTH - IMAGE_WIDTH) / 2,
                  width: IMAGE_WIDTH,
                }}
              />

              {slide.stickers?.map((sticker, index) => (
                <img
                  key={index}
                  src={sticker.src}
                  alt=""
                  aria-hidden="true"
                  className="absolute"
                  style={{
                    top: sticker.top,
                    left: sticker.left,
                    width: sticker.size,
                    height: sticker.size,
                    transform: sticker.rotate
                      ? `rotate(${sticker.rotate}deg)`
                      : undefined,
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        <button
          ref={closeButtonRef}
          type="button"
          aria-label="닫기"
          onClick={handleClose}
          className="absolute z-10 flex items-center justify-center"
          style={{
            top: CLOSE_HIT_AREA_INSET,
            left: CLOSE_HIT_AREA_INSET,
            width: MIN_TOUCH_TARGET,
            height: MIN_TOUCH_TARGET,
          }}
        >
          <img
            src={closeRounded}
            alt=""
            aria-hidden="true"
            style={{ width: CLOSE_ICON_SIZE, height: CLOSE_ICON_SIZE }}
          />
        </button>

        {slides.length > 1 && (
          <div
            className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center"
            style={{ top: DOT_TOP, gap: DOT_GAP }}
          >
            {slides.map((slide, index) => (
              <span
                key={slide.id}
                aria-hidden="true"
                style={{
                  width: index === activeIndex ? DOT_ACTIVE_WIDTH : DOT_SIZE,
                  height: DOT_SIZE,
                  borderRadius: 100,
                  backgroundColor:
                    index === activeIndex ? '#FF6F41' : '#A1A1A1',
                  transition: 'width 0.2s ease, background-color 0.2s ease',
                }}
              />
            ))}
          </div>
        )}

        <div
          className="absolute flex items-center justify-between"
          style={{
            top: FOOTER_TOP,
            left: 0,
            width: CARD_WIDTH,
            height: FOOTER_HEIGHT,
            paddingLeft: FOOTER_SIDE_PADDING,
            paddingRight: FOOTER_SIDE_PADDING,
            backgroundColor: '#F9F9F9',
          }}
        >
          <button
            type="button"
            aria-pressed={dontShowAgain}
            onClick={() => setDontShowAgain((prev) => !prev)}
            className="flex items-center"
            style={{ gap: FOOTER_GAP }}
          >
            {dontShowAgain ? (
              <IoCheckmarkCircle
                aria-hidden="true"
                style={{
                  width: CHECK_ICON_SIZE,
                  height: CHECK_ICON_SIZE,
                  color: '#FF6F41',
                }}
              />
            ) : (
              <IoEllipseOutline
                aria-hidden="true"
                style={{
                  width: CHECK_ICON_SIZE,
                  height: CHECK_ICON_SIZE,
                  color: '#A1A1A1',
                }}
              />
            )}
            <span style={{ fontSize: FOOTER_FONT_SIZE, color: '#A1A1A1' }}>
              다시 보지 않기
            </span>
          </button>
          <button
            type="button"
            onClick={handleClose}
            style={{ fontSize: FOOTER_FONT_SIZE, color: '#A1A1A1' }}
          >
            닫기
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default OnboardingModal;
