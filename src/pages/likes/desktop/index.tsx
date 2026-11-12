import {
  MdCalendarToday,
  MdLocationOn,
  MdNearMe,
  MdPerson,
} from 'react-icons/md';

import oheart from '../../../assets/icons/oheart.svg';
import { toContentTagIds } from '../../../utils/contentTags';
import DesktopFilterDropdown from '../../my-activity/desktop/DesktopFilterDropdown';
import MyActivityListCard, {
  type ActivityInfoItem,
} from '../../my-activity/desktop/MyActivityListCard';
import MyActivityShell from '../../my-activity/desktop/MyActivityShell';
import {
  LIKED_CATEGORY_OPTIONS,
  LIKED_SORT_OPTIONS,
} from '../constants/filters';
import { useLikesPage } from '../hooks/useLikesPage';
import { toLikedItemInfoLines } from '../utils/likedItems';

// Figma 1440 데스크톱 시안(5745:34604) 기준 리터럴 px.
const LIKE_BUTTON_PADDING = 12;
const LIKE_ICON_SIZE = 24;

function toInfoItems(
  firstInfo: string,
  secondInfo: string,
  thirdInfo?: string
): ActivityInfoItem[] {
  const items: ActivityInfoItem[] = [
    { icon: MdCalendarToday, text: firstInfo },
    { icon: MdLocationOn, text: secondInfo },
  ];

  if (thirdInfo) {
    items.push({ icon: MdPerson, text: thirdInfo });
  }

  return items.filter((entry) => entry.text !== '');
}

function LikesDesktopPage() {
  const {
    selectedFilters,
    handleFilterSelect,
    likedItems,
    getPlaceOpeningLabel,
    handleCardClick,
    handleUnlike,
    loadMoreRef,
    isError,
    hasEmptyResult,
  } = useLikesPage();

  return (
    <MyActivityShell activeTab="likes">
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-center justify-between">
          <DesktopFilterDropdown
            label="분류"
            options={LIKED_CATEGORY_OPTIONS}
            value={selectedFilters.category}
            onChange={(option) => handleFilterSelect('category', option)}
          />
          <DesktopFilterDropdown
            label="정렬"
            options={LIKED_SORT_OPTIONS}
            value={selectedFilters.sort}
            onChange={(option) => handleFilterSelect('sort', option)}
            align="right"
          />
        </div>

        {likedItems.length > 0 ? (
          <div className="flex flex-col">
            {likedItems.map((item) => {
              const { firstInfo, secondInfo, thirdInfo, distanceInfo } =
                toLikedItemInfoLines(item);
              const isPlace = item.category === 'PLACE';

              return (
                <MyActivityListCard
                  key={`${item.category}-${item.id}`}
                  image={item.thumbnailUrl}
                  title={item.title}
                  info={toInfoItems(
                    isPlace ? getPlaceOpeningLabel(item) : firstInfo,
                    secondInfo,
                    thirdInfo
                  )}
                  extraInfo={
                    distanceInfo
                      ? { icon: MdNearMe, text: distanceInfo }
                      : undefined
                  }
                  tags={isPlace ? [] : toContentTagIds(item.hashtags)}
                  onClick={() => handleCardClick(item)}
                  action={
                    <button
                      type="button"
                      aria-label={`${item.title} 좋아요 취소`}
                      onClick={() => void handleUnlike(item)}
                      style={{ padding: LIKE_BUTTON_PADDING }}
                    >
                      <img
                        src={oheart}
                        alt=""
                        draggable={false}
                        style={{
                          width: LIKE_ICON_SIZE,
                          height: LIKE_ICON_SIZE,
                        }}
                      />
                    </button>
                  }
                />
              );
            })}
          </div>
        ) : null}

        {hasEmptyResult ? (
          <p className="text-gray-4 mt-[40px] text-center text-[16px] font-medium">
            좋아요한 항목이 없습니다.
          </p>
        ) : null}

        {isError ? (
          <p
            role="alert"
            className="text-main-5 mt-[24px] text-center text-[16px] font-medium"
          >
            좋아요 목록을 불러오지 못했어요.
          </p>
        ) : null}

        <div ref={loadMoreRef} className="h-[40px]" aria-hidden="true" />
      </div>
    </MyActivityShell>
  );
}

export default LikesDesktopPage;
