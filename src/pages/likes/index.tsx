import { useMemo, useState } from 'react';

import {
  ContentCard,
  CourseFilterBar,
  SearchBar,
} from '../../components/common';
import {
  LIKED_ITEM_FILTER_GRID_CLASS_NAME,
  getLikedItemFilterColumnClassName,
} from '../../constants/courseFilterLayout';
import { useGlobalScale } from '../../hooks/useGlobalScale';

import {
  LIKED_CATEGORY_OPTIONS,
  LIKED_SORT_OPTIONS,
  type LikedItemFilterKey,
} from './constants/filters';
import { MOCK_LIKED_ITEMS } from './constants/mockLikedItems';
import useLikedItemFilters from './hooks/useLikedItemFilters';
import {
  filterLikedItems,
  getDetailFilterOptions,
  sortLikedItems,
  toLikedItemInfoLines,
} from './utils/likedItems';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 5;
const DESCRIPTION_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 17;
const SEARCH_MARGIN_TOP = 16;
const FILTER_MARGIN_TOP = 10;
const LIST_MARGIN_TOP = 24;
const LIST_GAP = 16;
const EMPTY_MARGIN_TOP = 40;
const EMPTY_TEXT_SIZE = 13;

function LikesPage() {
  const scale = useGlobalScale();
  const [keyword, setKeyword] = useState('');
  // ponytail: 좋아요 해제는 화면 상태로만 반영한다. API 연동 시 뮤테이션으로 교체.
  const [unlikedIds, setUnlikedIds] = useState<ReadonlySet<string>>(new Set());

  const {
    filterContainerRef,
    openFilterKey,
    selectedFilters,
    handleFilterToggle,
    handleFilterSelect,
  } = useLikedItemFilters();

  const activeLikedItems = useMemo(
    () =>
      MOCK_LIKED_ITEMS.filter(
        (item) => !unlikedIds.has(`${item.category}-${item.id}`)
      ),
    [unlikedIds]
  );

  const filterGroups = useMemo(
    () =>
      [
        { key: 'category', options: LIKED_CATEGORY_OPTIONS },
        {
          key: 'detail',
          options: getDetailFilterOptions(
            selectedFilters.category,
            activeLikedItems
          ),
        },
        { key: 'sort', options: LIKED_SORT_OPTIONS },
      ] as const satisfies readonly {
        key: LikedItemFilterKey;
        options: readonly string[];
      }[],
    [selectedFilters.category, activeLikedItems]
  );

  const likedItems = useMemo(
    () =>
      sortLikedItems(
        filterLikedItems({
          items: activeLikedItems,
          categoryLabel: selectedFilters.category,
          detailLabel: selectedFilters.detail,
          keyword,
        }),
        selectedFilters.sort
      ),
    [activeLikedItems, keyword, selectedFilters]
  );

  const toggleLike = (itemKey: string) => {
    setUnlikedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(itemKey)) {
        nextIds.delete(itemKey);
      } else {
        nextIds.add(itemKey);
      }

      return nextIds;
    });
  };

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
          좋아요한 코스와 장소
        </h1>
        <p
          className="text-gray-4 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          마음에 들었던 여행을 다시 만나보세요
        </p>
      </div>

      <div style={{ marginTop: SEARCH_MARGIN_TOP * scale }}>
        <SearchBar
          placeholder="좋아요 누른 코스나 장소를 검색해 보세요"
          label="좋아요 목록 검색"
          onQueryChange={setKeyword}
          onSearch={setKeyword}
        />
      </div>

      <CourseFilterBar
        filterGroups={filterGroups}
        selectedFilters={selectedFilters}
        openFilterKey={openFilterKey}
        filterContainerRef={filterContainerRef}
        gridClassName={LIKED_ITEM_FILTER_GRID_CLASS_NAME}
        getColumnClassName={getLikedItemFilterColumnClassName}
        marginTop={FILTER_MARGIN_TOP}
        onToggle={handleFilterToggle}
        onSelect={handleFilterSelect}
      />

      {likedItems.length > 0 ? (
        <div
          className="grid grid-cols-2"
          style={{
            marginTop: LIST_MARGIN_TOP * scale,
            columnGap: LIST_GAP * scale,
            rowGap: LIST_GAP * scale,
          }}
        >
          {likedItems.map((item) => {
            const itemKey = `${item.category}-${item.id}`;
            const { firstInfo, secondInfo, thirdInfo } =
              toLikedItemInfoLines(item);

            return (
              <ContentCard
                key={itemKey}
                image={item.thumbnailUrl}
                title={item.title}
                firstInfo={firstInfo}
                secondInfo={secondInfo}
                thirdInfo={thirdInfo}
                tags={item.hashtags}
                liked={!unlikedIds.has(itemKey)}
                className="w-full"
                onLikeClick={() => toggleLike(itemKey)}
              />
            );
          })}
        </div>
      ) : (
        <p
          className="text-gray-4 text-center font-medium"
          style={{
            marginTop: EMPTY_MARGIN_TOP * scale,
            fontSize: EMPTY_TEXT_SIZE * scale,
          }}
        >
          좋아요한 항목이 없습니다.
        </p>
      )}
    </section>
  );
}

export default LikesPage;
