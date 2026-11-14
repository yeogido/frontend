import { useQuery } from '@tanstack/react-query';
import { IoSearch } from 'react-icons/io5';

import { getPopularRegions } from '../../../../apis/regions.api';
import { mapPopularRegionToTravelRecordRegion } from '../../mappers/travelRecordApiMapper';
import { TravelFolderArtwork } from '../../components';
import RegionSuggestionList from '../../region-selection/components/RegionSuggestionList';
import SelectedRegionSearchBar from '../../region-selection/components/SelectedRegionSearchBar';
import { useRegionSelectionPage } from '../../region-selection/useRegionSelectionPage';
import closeRounded from '../../../../assets/icons/close-rounded.svg';
import CreateStepLayout from './CreateStepLayout';
import FolderPreviewCard from './FolderPreviewCard';

const POPULAR_REGION_COUNT = 8;
const POPULAR_STALE_TIME_MS = 5 * 60_000;

/** Figma 6330:58362 — 어디를 다녀오셨나요? */
function RegionSelectionDesktopPage() {
  const {
    isSuggestionOpen,
    query,
    recentSearches,
    selectedRegion,
    visibleSuggestions,
    clearRecentSearches,
    clearSelectedRegion,
    handleNext,
    openSuggestions,
    removeRecentSearch,
    selectRegionName,
    submitSearch,
    updateQuery,
  } = useRegionSelectionPage();
  const popularQuery = useQuery({
    queryKey: ['regions', 'popular'],
    queryFn: getPopularRegions,
    staleTime: POPULAR_STALE_TIME_MS,
  });
  const popularRegions = (popularQuery.data ?? [])
    .map(mapPopularRegionToTravelRecordRegion)
    .slice(0, POPULAR_REGION_COUNT);

  return (
    <CreateStepLayout
      title="어디를 다녀오셨나요?"
      description="다녀온 지역을 검색하거나 선택해 주세요"
      actionLabel="날짜 선택하기"
      actionDisabled={!selectedRegion}
      onAction={handleNext}
      preview={
        <FolderPreviewCard
          art={<TravelFolderArtwork photos={[]} title="" decorations={[]} />}
          regionName={selectedRegion?.selectionName ?? ''}
          caption={
            <span className="text-gray-4 text-[12px]">
              다녀온 날짜를 선택해 주세요
            </span>
          }
        />
      }
    >
      <form role="search" onSubmit={submitSearch} className="relative z-20">
        {selectedRegion ? (
          <SelectedRegionSearchBar
            region={selectedRegion}
            onClear={clearSelectedRegion}
          />
        ) : (
          <>
            <label htmlFor="travel-record-region-search" className="sr-only">
              지역명 또는 도시명 검색
            </label>
            <div className="border-gray-2 flex h-[48px] items-center gap-[10px] rounded-[12px] border bg-white px-[16px]">
              <IoSearch
                aria-hidden="true"
                className="text-gray-4 shrink-0 text-[24px]"
              />
              <input
                id="travel-record-region-search"
                type="search"
                value={query}
                onFocus={openSuggestions}
                onChange={(event) => updateQuery(event.target.value)}
                placeholder="지역명 또는 도시명을 검색해 주세요"
                autoComplete="off"
                className="placeholder:text-gray-4 text-gray-5 min-w-0 flex-1 bg-transparent text-[14px] font-medium outline-none"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="검색어 지우기"
                  onClick={() => updateQuery('')}
                  className="flex size-[24px] items-center justify-center"
                >
                  <img src={closeRounded} alt="" className="size-[16px]" />
                </button>
              ) : null}
            </div>
          </>
        )}
        {!selectedRegion && isSuggestionOpen ? (
          <RegionSuggestionList
            query={query}
            suggestions={visibleSuggestions}
            onSelect={selectRegionName}
          />
        ) : null}
      </form>

      {recentSearches.length > 0 ? (
        <section aria-label="최근 검색" className="mt-[32px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-black">최근 검색</h2>
            <button
              type="button"
              onClick={clearRecentSearches}
              className="text-gray-4 text-[14px]"
            >
              전체 삭제
            </button>
          </div>
          <ul className="mt-[20px] flex flex-wrap gap-[8px]">
            {recentSearches.map((search, index) => (
              <li
                key={`${search}-${index}`}
                className="flex h-[36px] items-center gap-[4px] rounded-full bg-[#f1f1f1] pr-[10px] pl-[16px] text-[14px] font-medium text-black"
              >
                <button type="button" onClick={() => selectRegionName(search)}>
                  {search}
                </button>
                <button
                  type="button"
                  aria-label={`${search} 최근 검색어 삭제`}
                  onClick={() => removeRecentSearch(index)}
                  className="flex size-[16px] items-center justify-center"
                >
                  <img src={closeRounded} alt="" className="size-[16px]" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-label="인기 지역" className="mt-[32px]">
        <h2 className="text-[16px] font-semibold text-black">인기 지역</h2>
        {popularQuery.isError ? (
          <p role="alert" className="text-gray-4 mt-[20px] text-[14px]">
            인기 지역을 불러오지 못했어요.
          </p>
        ) : (
          <ul className="mt-[20px] grid grid-cols-4 gap-[16px]">
            {popularRegions.map((region) => (
              <li key={region.id}>
                <button
                  type="button"
                  onClick={() => selectRegionName(region.name)}
                  aria-pressed={selectedRegion?.id === region.id}
                  className={`bg-gray-3 relative block h-[169px] w-full overflow-hidden rounded-[12px] text-left ${
                    selectedRegion?.id === region.id ? 'ring-main-5 ring-2' : ''
                  }`}
                >
                  {region.imageSrc ? (
                    <img
                      src={region.imageSrc}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : null}
                  <span className="absolute inset-0 bg-black/30" />
                  <span className="absolute bottom-[12px] left-[12px] flex max-w-[116px] flex-col gap-[2px] text-white">
                    <span className="truncate text-[16px] font-medium">
                      {region.name}
                    </span>
                    <span className="truncate text-[12px]">
                      {region.province}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </CreateStepLayout>
  );
}

export default RegionSelectionDesktopPage;
