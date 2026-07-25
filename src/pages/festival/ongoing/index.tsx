import { useCallback } from 'react';

import {
  ContentCard,
  ContentCardSkeleton,
} from '../../../components/common';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';

import { FestivalFilterBar } from '../components';
import { FESTIVAL_SKELETON_ITEMS } from '../constants/ui';
import useFestivalFilters from '../hooks/useFestivalFilters';
import useFestivals from '../hooks/useFestivals';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 21;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 17;
const LIST_MARGIN_TOP = 24;
const LIST_GAP = 16;
const EMPTY_MARGIN_TOP = 40;
const ERROR_MARGIN_TOP = 24;
const MESSAGE_TEXT_SIZE = 13;
const LOAD_MORE_HEIGHT = 40;

function FestivalOngoingPage() {
  const scale = useGlobalScale();
  const {
    selectedFilters,
    handleSortSelect,
    handleCategorySelect,
  } = useFestivalFilters();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useFestivals({
    filters: selectedFilters,
    status: 'ONGOING',
  });

  const festivals = data?.pages.flatMap((page) => page.content) ?? [];
  const hasEmptyResult = !isPending && !isError && festivals.length === 0;

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending,
    onIntersect: handleIntersect,
  });

  return (
    <section
      className="mx-auto flex min-h-screen w-full flex-col"
      style={{
        paddingLeft: PAGE_PADDING_X * scale,
        paddingRight: PAGE_PADDING_X * scale,
        paddingTop: PAGE_PADDING_TOP * scale,
        paddingBottom: PAGE_PADDING_BOTTOM * scale,
      }}
    >
      <div>
        <h1
          className="font-semibold text-black"
          style={{
            fontSize: TITLE_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          진행 중인 행사
        </h1>
        <p
          className="font-normal text-gray-5"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          지금 참여할 수 있는 행사를 만나보세요
        </p>
      </div>

      <FestivalFilterBar
        selectedSort={selectedFilters.sort}
        selectedCategory={selectedFilters.category}
        onSortSelect={handleSortSelect}
        onCategorySelect={handleCategorySelect}
      />

      <div
        className="grid grid-cols-2"
        style={{
          marginTop: LIST_MARGIN_TOP * scale,
          columnGap: LIST_GAP * scale,
          rowGap: LIST_GAP * scale,
        }}
      >
        {isPending
          ? FESTIVAL_SKELETON_ITEMS.map((item) => (
              <ContentCardSkeleton
                key={item}
                className="w-full"
                imageClassName="aspect-[163/115] h-auto"
              />
            ))
          : festivals.map((festival) => (
              <ContentCard
                key={festival.id}
                image={festival.image}
                title={festival.title}
                firstInfo={festival.period}
                secondInfo={festival.location}
                liked={festival.liked}
                tags={festival.tags}
                className="w-full"
              />
            ))}

        {isFetchingNextPage
          ? FESTIVAL_SKELETON_ITEMS.slice(0, 4).map((item) => (
              <ContentCardSkeleton
                key={`next-page-${item}`}
                className="w-full"
                imageClassName="aspect-[163/115] h-auto"
              />
            ))
          : null}
      </div>

      {hasEmptyResult ? (
        <p
          className="text-center font-medium text-gray-4"
          style={{
            marginTop: EMPTY_MARGIN_TOP * scale,
            fontSize: MESSAGE_TEXT_SIZE * scale,
          }}
        >
          진행 중인 행사가 없습니다.
        </p>
      ) : null}

      {isError ? (
        <p
          className="text-main-5 text-center font-medium"
          style={{
            marginTop: ERROR_MARGIN_TOP * scale,
            fontSize: MESSAGE_TEXT_SIZE * scale,
          }}
        >
          행사 목록을 불러오지 못했어요.
        </p>
      ) : null}

      <div
        ref={loadMoreRef}
        style={{ height: LOAD_MORE_HEIGHT * scale }}
        aria-hidden="true"
      />
    </section>
  );
}

export default FestivalOngoingPage;
