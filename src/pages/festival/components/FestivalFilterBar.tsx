import { useEffect, useRef, useState } from 'react';

import calendarIcon from '../../../assets/icons/calendar.svg';
import vector from '../../../assets/icons/vector.svg';
import gridViewFilterChip from '../../../assets/category-tag-chip/gridview.svg';
import { HorizontalFadeScroll } from '../../../components/common';
import { useScaleFrame } from '../../../hooks/useScaleFrame';
import {
  festivalCategoryOptions,
  festivalSortOptions,
  getFestivalSortLabel,
  type FestivalCategoryValue,
  type FestivalSortValue,
  type FestivalViewMode,
} from '../constants/filters';

const FILTER_DESIGN_WIDTH = 342;
const FILTER_HEIGHT = 29;
const FILTER_MARGIN_TOP = 12;

interface FestivalFilterBarProps {
  selectedSort: FestivalSortValue;
  selectedCategory: FestivalCategoryValue;
  onSortSelect: (sort: FestivalSortValue) => void;
  onCategorySelect: (category: FestivalCategoryValue) => void;
  /** 넘기면 정렬 옆에 행사 일정 ↔ 그리드 보기 전환 칩을 보여준다. */
  viewMode?: FestivalViewMode;
  onViewModeToggle?: () => void;
}

function FestivalFilterBar({
  selectedSort,
  selectedCategory,
  onSortSelect,
  onCategorySelect,
  viewMode,
  onViewModeToggle,
}: FestivalFilterBarProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(FILTER_DESIGN_WIDTH);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortFilterRef = useRef<HTMLDivElement>(null);
  const selectedSortLabel = getFestivalSortLabel(selectedSort);
  const isSortLabelLong = selectedSort === 'ENDING_SOON';
  const sortWidthClassName = isSortLabelLong ? 'w-[113px]' : 'w-[85px]';

  useEffect(() => {
    if (!isSortOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (sortFilterRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsSortOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSortOpen]);

  const handleSortSelect = (sort: FestivalSortValue) => {
    onSortSelect(sort);
    setIsSortOpen(false);
  };

  return (
    <div
      ref={outerRef}
      className="relative z-10 w-full overflow-visible"
      style={{
        marginTop: FILTER_MARGIN_TOP * scale,
        height: scaledHeight,
      }}
    >
      <div
        ref={innerRef}
        className="relative z-10 flex items-start gap-2 overflow-visible"
        style={{
          width: FILTER_DESIGN_WIDTH,
          height: FILTER_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div
          ref={sortFilterRef}
          className={`relative h-[29px] shrink-0 ${sortWidthClassName}`}
        >
          <button
            type="button"
            aria-expanded={isSortOpen}
            onClick={() => setIsSortOpen((isOpen) => !isOpen)}
            className="border-gray-2 bg-pure-white text-gray-4 flex h-[29px] w-full items-center justify-between rounded-full border px-2.5 py-1.5 text-[14px] leading-none font-normal"
          >
            <span className="whitespace-nowrap">{selectedSortLabel}</span>
            <img
              src={vector}
              alt=""
              aria-hidden="true"
              className={`h-3 w-3 transition-transform ${
                isSortOpen ? 'rotate-90' : ''
              }`}
            />
          </button>

          {isSortOpen ? (
            <div
              className={`absolute top-[33px] left-0 z-20 flex flex-col ${sortWidthClassName}`}
            >
              {festivalSortOptions.map((sort, index) => {
                const isSelected = selectedSort === sort.value;
                const radiusClassName =
                  index === 0
                    ? 'rounded-t-xl'
                    : index === festivalSortOptions.length - 1
                      ? 'rounded-b-xl'
                      : '';

                return (
                  <button
                    key={sort.value}
                    type="button"
                    onClick={() => handleSortSelect(sort.value)}
                    className={`border-gray-2 text-gray-4 h-[37px] border-x border-t px-2.5 text-left text-[14px] leading-none font-normal whitespace-nowrap last:border-b ${radiusClassName} ${
                      isSelected ? 'bg-gray-2' : 'bg-pure-white'
                    }`}
                  >
                    {sort.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {viewMode && onViewModeToggle ? (
          <FestivalViewModeChip
            viewMode={viewMode}
            onToggle={onViewModeToggle}
          />
        ) : null}

        <HorizontalFadeScroll
          className="min-w-0 flex-1"
          contentClassName="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          fadeWidth={8}
        >
          {festivalCategoryOptions.map((category) => {
            const isSelected = selectedCategory === category.value;

            return (
              <button
                key={category.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onCategorySelect(category.value)}
                className={`h-[29px] shrink-0 rounded-full border px-3 py-1.5 text-[14px] leading-none font-normal whitespace-nowrap ${
                  isSelected
                    ? 'border-main-5 bg-main-2 text-main-5'
                    : 'border-gray-2 bg-pure-white text-gray-4'
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </HorizontalFadeScroll>
      </div>
    </div>
  );
}

interface FestivalViewModeChipProps {
  viewMode: FestivalViewMode;
  onToggle: () => void;
}

/** 지금 보기와 반대 보기로 가는 칩이다. 그리드에선 행사 일정, 달력에선 그리드 보기. */
function FestivalViewModeChip({
  viewMode,
  onToggle,
}: FestivalViewModeChipProps) {
  const isCalendarMode = viewMode === 'calendar';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={
        isCalendarMode ? '그리드 보기로 전환' : '행사 일정 보기로 전환'
      }
      className="border-gray-2 bg-pure-white text-gray-4 flex h-[29px] shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[14px] leading-none font-normal whitespace-nowrap"
    >
      <span
        aria-hidden="true"
        className="relative flex size-4 shrink-0 items-center justify-center overflow-hidden"
      >
        {isCalendarMode ? (
          // 그리드 아이콘은 소상공인 보기 전환 칩 이미지에서 아이콘 부분만 잘라 쓴다.
          <img
            src={gridViewFilterChip}
            alt=""
            className="absolute top-1/2 left-0 h-[29px] w-[109px] max-w-none -translate-x-[12px] -translate-y-1/2"
          />
        ) : (
          <img src={calendarIcon} alt="" className="h-[13px] w-3" />
        )}
      </span>
      <span>{isCalendarMode ? '그리드 보기' : '행사 일정'}</span>
    </button>
  );
}

export default FestivalFilterBar;
