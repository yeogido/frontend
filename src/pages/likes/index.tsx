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
import { toContentTagIds } from '../../utils/contentTags';

import { useLikesPage } from './hooks/useLikesPage';
import { toLikedItemInfoLines } from './utils/likedItems';

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
const ERROR_MARGIN_TOP = 24;
const LOAD_MORE_HEIGHT = 40;

function LikesPage() {
  const scale = useGlobalScale();
  const {
    setKeyword,
    filterContainerRef,
    openFilterKey,
    selectedFilters,
    handleFilterToggle,
    handleFilterSelect,
    filterGroups,
    likedItems,
    getPlaceOpeningLabel,
    handleCardClick,
    handleUnlike,
    loadMoreRef,
    isError,
    hasEmptyResult,
  } = useLikesPage();

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
          마음에 들었던 여행을 다시 만나보세요.
        </p>
      </div>

      <div style={{ marginTop: SEARCH_MARGIN_TOP * scale }}>
        <SearchBar
          placeholder="좋아요한 코스와 장소를 검색해 보세요"
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
            const { firstInfo, secondInfo, thirdInfo, distanceInfo } =
              toLikedItemInfoLines(item);

            return (
              <ContentCard
                key={`${item.category}-${item.id}`}
                image={item.thumbnailUrl}
                title={item.title}
                firstInfo={
                  item.category === 'PLACE'
                    ? getPlaceOpeningLabel(item)
                    : firstInfo
                }
                secondInfo={secondInfo}
                thirdInfo={thirdInfo}
                distanceInfo={distanceInfo}
                tags={toContentTagIds(item.hashtags)}
                liked
                className="w-full"
                onClick={() => handleCardClick(item)}
                onLikeClick={() => void handleUnlike(item)}
              />
            );
          })}
        </div>
      ) : null}

      {hasEmptyResult ? (
        <p
          className="text-gray-4 text-center font-medium"
          style={{
            marginTop: EMPTY_MARGIN_TOP * scale,
            fontSize: EMPTY_TEXT_SIZE * scale,
          }}
        >
          좋아요한 항목이 없습니다.
        </p>
      ) : null}

      {isError ? (
        <p
          className="text-main-5 text-center font-medium"
          style={{
            marginTop: ERROR_MARGIN_TOP * scale,
            fontSize: EMPTY_TEXT_SIZE * scale,
          }}
        >
          좋아요 목록을 불러오지 못했어요.
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

export default LikesPage;
