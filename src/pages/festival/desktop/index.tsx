import { FestivalDeleteDialog } from '../../../components/common';
import DesktopFilterChip from '../../../components/layout/desktop/DesktopFilterChip';
import DesktopFilterDropdown from '../../../components/layout/desktop/DesktopFilterDropdown';
import DesktopPageShell from '../../../components/layout/desktop/DesktopPageShell';
import { toContentTagIds } from '../../../utils/contentTags';
import {
  festivalCategoryOptions,
  festivalSortOptions,
  getFestivalSortLabel,
} from '../constants/filters';
import FestivalDayPanel from './FestivalDayPanel';
import FestivalDesktopCalendar from './FestivalDesktopCalendar';
import FestivalDesktopCard from './FestivalDesktopCard';
import { useFestivalDesktop } from './useFestivalDesktop';

// Figma 1440 데스크톱 시안(6276:38914) 기준 리터럴 px.
const CONTENT_WIDTH = 1048;
const TITLE_OFFSET_TOP = 60;
const SKELETON_COUNT = 6;
const SKELETON_HEIGHT = 350;
const SORT_LABELS = festivalSortOptions.map((option) => option.label);

function FestivalDesktopPage() {
  const {
    selectedFilters,
    handleCategorySelect,
    handleSortChange,
    calendarMonth,
    shiftMonth,
    selectedDate,
    selectDate,
    festivals,
    dayFestivals,
    isPending,
    isError,
    isFetchingNextPage,
    isDayPanelPending,
    loadMoreRef,
    getLiked,
    toggleLike,
    goToFestival,
    editFestival,
    requestDelete,
    dialogProps,
  } = useFestivalDesktop();

  const hasEmptyResult = !isPending && !isError && festivals.length === 0;

  return (
    <DesktopPageShell contentWidth={CONTENT_WIDTH}>
      <div
        style={{ paddingTop: TITLE_OFFSET_TOP }}
        className="flex flex-col gap-[32px]"
      >
        <header className="flex flex-col gap-[6px]">
          <h1 className="text-[32px] font-semibold text-black">
            어디로 떠나볼까요?
          </h1>
          <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
            다양한 지역의 행사를 만나보세요
          </p>
        </header>

        <div className="flex flex-col gap-[60px]">
          <div className="flex items-stretch gap-[24px]">
            <div className="w-[621px] shrink-0">
              <FestivalDesktopCalendar
                month={calendarMonth}
                selectedDate={selectedDate}
                onMonthShift={shiftMonth}
                onDateSelect={selectDate}
              />
            </div>
            <div className="min-w-0 flex-1">
              <FestivalDayPanel
                selectedDate={selectedDate}
                isPending={isDayPanelPending}
                items={dayFestivals.map((festival) => ({
                  id: festival.contentId,
                  image: festival.thumbnailImageUrl,
                  title: festival.title,
                  regionName: festival.regionName,
                  tags: toContentTagIds(festival.hashtags),
                  liked: getLiked(festival.contentId, festival.isLiked),
                  canLike: !festival.canManage,
                }))}
                onItemClick={goToFestival}
                onLikeClick={(id) => {
                  const festival = dayFestivals.find(
                    (item) => item.contentId === id
                  );
                  if (!festival) return;

                  toggleLike(id, getLiked(id, festival.isLiked));
                }}
              />
            </div>
          </div>

          <section className="flex flex-col gap-[32px]">
            <div className="flex items-center gap-[16px]">
              <DesktopFilterDropdown
                label="정렬"
                options={SORT_LABELS}
                value={getFestivalSortLabel(selectedFilters.sort)}
                onChange={(label) => {
                  const option = festivalSortOptions.find(
                    (item) => item.label === label
                  );
                  if (option) handleSortChange(option.value);
                }}
              />
              {festivalCategoryOptions.map((option) => (
                <DesktopFilterChip
                  key={option.value}
                  label={option.label}
                  selected={selectedFilters.category === option.value}
                  onClick={() => handleCategorySelect(option.value)}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-x-[24px] gap-y-[24px]">
              {isPending
                ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                    <div
                      key={index}
                      aria-hidden="true"
                      style={{ height: SKELETON_HEIGHT }}
                      className="bg-gray-2 animate-pulse rounded-[12px]"
                    />
                  ))
                : festivals.map((festival) => (
                    <FestivalDesktopCard
                      key={festival.contentId}
                      image={festival.thumbnailImageUrl}
                      title={festival.title}
                      startDate={festival.startDate}
                      endDate={festival.endDate}
                      regionName={festival.regionName}
                      tags={toContentTagIds(festival.hashtags)}
                      isAdmin={festival.canManage}
                      liked={getLiked(festival.contentId, festival.isLiked)}
                      onClick={() => goToFestival(festival.contentId)}
                      onLikeClick={() =>
                        toggleLike(
                          festival.contentId,
                          getLiked(festival.contentId, festival.isLiked)
                        )
                      }
                      onEdit={() => void editFestival(festival.contentId)}
                      onDelete={() => requestDelete(festival.contentId)}
                    />
                  ))}
            </div>

            {isFetchingNextPage ? (
              <p className="text-gray-4 text-center text-[16px]">
                불러오는 중이에요.
              </p>
            ) : null}

            {hasEmptyResult ? (
              <p className="text-gray-4 text-center text-[16px] font-medium">
                진행 중인 행사가 없습니다.
              </p>
            ) : null}

            {isError ? (
              <p
                role="alert"
                className="text-main-5 text-center text-[16px] font-medium"
              >
                행사 목록을 불러오지 못했어요.
              </p>
            ) : null}

            <div ref={loadMoreRef} className="h-[40px]" aria-hidden="true" />
          </section>
        </div>
      </div>

      <FestivalDeleteDialog {...dialogProps} />
    </DesktopPageShell>
  );
}

export default FestivalDesktopPage;
