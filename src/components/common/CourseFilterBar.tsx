import type { RefObject } from 'react';
import { useId } from 'react';
import { IoChevronDown } from 'react-icons/io5';

import {
  COURSE_FILTER_CONTAINER_CLASS_NAME,
  getCourseFilterColumnClassName,
  getCourseFilterGridClassName,
} from '../../constants/courseFilterLayout';
import { useGlobalScale } from '../../hooks/useGlobalScale';

const FILTER_DESIGN_WIDTH = 342;
const FILTER_HEIGHT = 29;

export interface CourseFilterGroup<TKey extends string> {
  key: TKey;
  options: readonly string[];
}

interface CourseFilterBarProps<TKey extends string> {
  filterGroups: readonly CourseFilterGroup<TKey>[];
  selectedFilters: Record<TKey, string>;
  openFilterKey: TKey | null;
  filterContainerRef: RefObject<HTMLDivElement | null>;
  /** 코스 필터 전용. 다른 화면에서 gridClassName을 직접 넘길 때는 사용하지 않는다. */
  isExtendedTransport?: boolean;
  /** 코스 필터 그리드가 아닌 다른 칩 배치가 필요할 때 그리드 클래스를 대체한다. */
  gridClassName?: string;
  /** gridClassName을 대체했을 때 각 칩이 놓일 컬럼 클래스를 함께 넘긴다. */
  getColumnClassName?: (filterKey: TKey) => string;
  marginTop: number;
  onToggle: (filterKey: TKey) => void;
  onSelect: (filterKey: TKey, option: string) => void;
}

interface CourseFilterChipProps {
  label: string;
  options: readonly string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (option: string) => void;
}

function CourseFilterChip({
  label,
  options,
  isOpen,
  onToggle,
  onSelect,
}: CourseFilterChipProps) {
  const buttonId = useId();
  const listboxId = useId();

  return (
    <div className="relative w-full min-w-0">
      <button
        id={buttonId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={onToggle}
        className="border-gray-2 bg-pure-white text-gray-4 flex h-[29px] w-full items-center justify-between gap-1 rounded-full border px-2.5 py-1.5 text-[14px] leading-none font-normal whitespace-nowrap"
      >
        <span>{label}</span>
        <IoChevronDown
          aria-hidden="true"
          className={`shrink-0 text-[12px] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={buttonId}
          className="absolute top-[33px] left-0 z-40 flex min-w-full flex-col"
        >
          {options.map((option, index) => {
            const isFirst = index === 0;
            const isLast = index === options.length - 1;
            const optionRadius =
              isFirst && isLast
                ? 'rounded-xl'
                : isFirst
                  ? 'rounded-t-xl'
                  : isLast
                    ? 'rounded-b-xl'
                    : '';

            return (
              <button
                key={`${option}-${index}`}
                type="button"
                role="option"
                aria-selected={option === label}
                onClick={() => onSelect(option)}
                className={`border-gray-2 bg-pure-white text-gray-4 flex h-[29px] w-full min-w-max items-center border px-2.5 py-1.5 text-left text-[14px] leading-none font-normal whitespace-nowrap ${optionRadius} ${
                  index > 0 ? '-mt-px' : ''
                } ${option === label ? 'text-black' : ''}`}
              >
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function CourseFilterBar<TKey extends string>({
  filterGroups,
  selectedFilters,
  openFilterKey,
  filterContainerRef,
  isExtendedTransport = false,
  gridClassName,
  getColumnClassName = getCourseFilterColumnClassName,
  marginTop,
  onToggle,
  onSelect,
}: CourseFilterBarProps<TKey>) {
  const scale = useGlobalScale();
  const filterGridClassName =
    gridClassName ?? getCourseFilterGridClassName(isExtendedTransport);

  return (
    <div
      ref={filterContainerRef}
      className={COURSE_FILTER_CONTAINER_CLASS_NAME}
      style={{
        marginTop: marginTop * scale,
        height: FILTER_HEIGHT * scale,
      }}
    >
      <div
        className={filterGridClassName}
        style={{
          width: FILTER_DESIGN_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {filterGroups.map((filter) => (
          <div key={filter.key} className={getColumnClassName(filter.key)}>
            <CourseFilterChip
              label={selectedFilters[filter.key]}
              options={filter.options}
              isOpen={openFilterKey === filter.key}
              onToggle={() => onToggle(filter.key)}
              onSelect={(option) => onSelect(filter.key, option)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseFilterBar;
