import { useCallback, useEffect, useRef, useState } from 'react';
import { IoSearch } from 'react-icons/io5';

import { ContentCard, ContentCardSkeleton } from '../../../components/common';

import { YeogidoCourseFilterChip } from './components';
import courseMapImage from './assets/courseimage.svg';
import useInfiniteScroll from './hooks/useInfiniteScroll';
import useYeogidoCourses from './hooks/useYeogidoCourses';

const filterGroups = [
  {
    key: 'transport',
    defaultLabel: '전체',
    options: ['전체', '도보', '대중교통', '자차'],
  },
  {
    key: 'duration',
    defaultLabel: '2박 3일',
    options: ['전체', '당일치기', '1박 2일', '2박 3일', '3박 이상'],
  },
  {
    key: 'companion',
    defaultLabel: '혼자',
    options: ['혼자', '친구와', '연인과', '가족과', '아이와'],
  },
  {
    key: 'sort',
    defaultLabel: '추천순',
    options: ['추천순', '저장순', '후기순'],
  },
] as const;

type FilterKey = (typeof filterGroups)[number]['key'];
type SelectedFilters = Record<FilterKey, string>;

const initialSelectedFilters = filterGroups.reduce((filters, filter) => {
  filters[filter.key] = filter.defaultLabel;
  return filters;
}, {} as SelectedFilters);

const skeletonItems = Array.from({ length: 8 }, (_, index) => index);

function YeogidoCourseSearchPage() {
  const filterContainerRef = useRef<HTMLDivElement | null>(null);
  const [openFilterKey, setOpenFilterKey] = useState<FilterKey | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(
    initialSelectedFilters
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useYeogidoCourses();

  const yeogidoCourses = data?.pages.flatMap((page) => page.content) ?? [];

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending,
    onIntersect: handleIntersect,
  });

  useEffect(() => {
    if (!openFilterKey) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        filterContainerRef.current?.contains(event.target as Node)
      ) {
        return;
      }

      setOpenFilterKey(null);
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [openFilterKey]);

  const handleFilterToggle = (filterKey: FilterKey) => {
    setOpenFilterKey((currentFilterKey) =>
      currentFilterKey === filterKey ? null : filterKey
    );
  };

  const handleFilterSelect = (filterKey: FilterKey, option: string) => {
    setSelectedFilters((currentFilters) => ({
      ...currentFilters,
      [filterKey]: option,
    }));
    setOpenFilterKey(null);
  };

  return (
    <section className="mx-6 mt-4 min-h-screen pb-10">
      <div className="w-full">
        <label className="flex h-[50px] items-center gap-3 rounded-[12px] border border-[#E2E2E2] bg-white px-4 text-[#7F7F7F]">
          <IoSearch aria-hidden="true" className="text-[24px]" />
          <input
            type="search"
            placeholder="코스명 또는 지역명을 검색해 주세요"
            className="min-w-0 flex-1 bg-transparent text-[12px] font-medium leading-none text-[#7F7F7F] outline-none placeholder:text-[#7F7F7F]"
          />
        </label>

        <div
          ref={filterContainerRef}
          className="mt-[14px] flex flex-wrap items-start gap-2"
        >
          {filterGroups.map((filter) => (
            <YeogidoCourseFilterChip
              key={filter.key}
              label={selectedFilters[filter.key]}
              options={[...filter.options]}
              isOpen={openFilterKey === filter.key}
              onToggle={() => handleFilterToggle(filter.key)}
              onSelect={(option) => handleFilterSelect(filter.key, option)}
            />
          ))}
        </div>

        <div className="mt-[27px] grid grid-cols-[repeat(auto-fill,minmax(163px,1fr))] gap-4">
          {isPending
            ? skeletonItems.map((item) => (
                <ContentCardSkeleton
                  key={item}
                  className="w-full"
                  imageClassName="aspect-[174/115] h-auto"
                />
              ))
            : yeogidoCourses.map((course) => (
                <ContentCard
                  key={course.id}
                  image={courseMapImage}
                  title={course.title}
                  firstInfo={course.duration}
                  secondInfo={course.courseName}
                  className="w-full"
                  imageClassName="aspect-[174/115] h-auto"
                />
              ))}

          {isFetchingNextPage
            ? skeletonItems.slice(0, 4).map((item) => (
                <ContentCardSkeleton
                  key={`next-page-${item}`}
                  className="w-full"
                  imageClassName="aspect-[174/115] h-auto"
                />
              ))
            : null}
        </div>

        {isError ? (
          <p className="mt-6 text-center text-[13px] font-medium text-[#E66F45]">
            코스 목록을 불러오지 못했어요.
          </p>
        ) : null}

        <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
      </div>
    </section>
  );
}

export default YeogidoCourseSearchPage;
