import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
} from '../../../components/common';
import { useOngoingContents } from '../../../hooks/useOngoingContents';
import { useContentLikeToggle } from '../../../hooks/useContentLikeToggle';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { toContentTagIds } from '../../../utils/contentTags';
import { buildFestivalDetailPath } from '../../../utils/routes';

import { FestivalFilterBar } from '../components';
import { FESTIVAL_SKELETON_ITEMS } from '../constants/ui';
import useFestivalFilters from '../hooks/useFestivalFilters';

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

function FestivalOngoingPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { getLiked, toggleLike } = useContentLikeToggle();
  const {
    selectedFilters,
    handleSortSelect,
    handleCategorySelect,
  } = useFestivalFilters();
  const { data: ongoingContents, isPending, isError } = useOngoingContents();

  // /contents/ongoing은 쿼리 파라미터를 아예 받지 않는 엔드포인트로 확인됨
  // (category/sort/cursor 등 어떤 값을 보내도, 심지어 존재하지 않는 값을
  // 보내도 항상 동일한 결과가 옴 - curl로 재확인). 응답 필드에도 category가
  // 없어 카테고리 필터(체험/전시/공연/축제)를 적용할 데이터가 없다. 정렬도
  // 종료 임박순(endDate)만 응답 필드로 계산 가능하고, 추천순/저장순/거리순은
  // 추천 점수·좋아요 수·좌표가 응답에 없어 그대로 원본 순서를 유지한다.
  // 필터 바 UI/상태는 그대로 두되, 실제 필터링·정렬은 API가 관련 필드/
  // 파라미터를 지원해야 완전히 동작한다 - 백엔드에 카테고리 필드 및
  // 정렬/페이지네이션 파라미터 추가를 요청해야 한다.
  const festivals = useMemo(() => {
    const items = ongoingContents ?? [];

    if (selectedFilters.sort !== 'ENDING_SOON') {
      return items;
    }

    return [...items].sort((a, b) => a.endDate.localeCompare(b.endDate));
  }, [ongoingContents, selectedFilters.sort]);

  const hasEmptyResult = !isPending && !isError && festivals.length === 0;

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
                key={festival.contentId}
                image={festival.thumbnailImageUrl}
                title={festival.title}
                firstInfo={`${festival.startDate} ~ ${festival.endDate}`}
                secondInfo={festival.regionName}
                tags={toContentTagIds(festival.hashtags)}
                liked={getLiked(festival.contentId, false)}
                className="w-full"
                onClick={() =>
                  navigate(buildFestivalDetailPath(festival.contentId))
                }
                onLikeClick={() =>
                  toggleLike(
                    festival.contentId,
                    getLiked(festival.contentId, false)
                  )
                }
              />
            ))}
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
    </section>
  );
}

export default FestivalOngoingPage;
