import { useEffect, useRef, useState } from 'react';

import vector from '../../../assets/icons/vector.svg';
import { useScaleFrame } from '../../../hooks/useScaleFrame';
import {
  festivalCategoryOptions,
  festivalSortOptions,
  getFestivalSortLabel,
  type FestivalCategoryValue,
  type FestivalSortValue,
} from '../constants/filters';

const FILTER_DESIGN_WIDTH = 342;
const FILTER_HEIGHT = 29;
const FILTER_MARGIN_TOP = 12;

interface FestivalFilterBarProps {
  selectedSort: FestivalSortValue;
  selectedCategory: FestivalCategoryValue;
  onSortSelect: (sort: FestivalSortValue) => void;
  onCategorySelect: (category: FestivalCategoryValue) => void;
}

function FestivalFilterBar({
  selectedSort,
  selectedCategory,
  onSortSelect,
  onCategorySelect,
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

        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
        </div>
      </div>
    </div>
  );
}

export default FestivalFilterBar;
