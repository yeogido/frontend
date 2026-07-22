import { useCallback } from 'react';

import {
  ContentCard,
  ContentCardSkeleton,
} from '../../../components/common';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';

import { FESTIVAL_SKELETON_ITEMS } from '../constants/ui';
import useRecentFestivals from '../hooks/useRecentFestivals';

function FestivalRecentPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useRecentFestivals();

  const recentFestivals = data?.pages.flatMap((page) => page.content) ?? [];
  const hasEmptyResult =
    !isPending && !isError && recentFestivals.length === 0;

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
    <section className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-6 pt-3 pb-10">
      <div>
        <h1 className="text-[18px] leading-[21px] font-semibold text-black">
          최근 본 행사
        </h1>
        <p className="mt-[6px] text-[14px] leading-[17px] font-normal text-gray-5">
          최근 확인한 행사를 다시 둘러보세요
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4">
        {isPending
          ? FESTIVAL_SKELETON_ITEMS.map((item) => (
              <ContentCardSkeleton
                key={item}
                className="w-full"
                imageClassName="aspect-[163/115] h-auto"
              />
            ))
          : recentFestivals.map((festival) => (
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
        <p className="mt-10 text-center text-[13px] font-medium text-gray-4">
          최근 본 행사가 없습니다.
        </p>
      ) : null}

      {isError ? (
        <p className="mt-6 text-center text-[13px] font-medium text-main-5">
          최근 본 행사를 불러오지 못했어요.
        </p>
      ) : null}

      <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
    </section>
  );
}

export default FestivalRecentPage;
