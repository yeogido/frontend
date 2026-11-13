import { useMemo, useState } from 'react';

import { LoadingSpinner } from '../../../../components/common';
import {
  useFriendTravelMap,
  useFriendTravelMapYears,
} from '../../../../hooks/useFriendTravelMap';
import { useTravelRecordRegionDetailsState } from '../../../../hooks/useTravelRecordRegions';
import {
  getUnresolvedFriendMapRegionIds,
  normalizeFriendTravelMapItem,
  toFriendRegionPhotoRecords,
} from '../../../../hooks/utils/friendTravelMapPages';
import Map from '../../../home/map/components/Map';
import { toRegionPhotoMap } from '../../../home/map/types/regionPhoto';
import TravelYearDropdown from '../../../travel-record/components/TravelYearDropdown';
import TravelYearDropdownSkeleton from '../../../travel-record/components/TravelYearDropdownSkeleton';

const EMPTY_MESSAGE = '아직 공개된 여행 기록이 없어요';
const LOAD_ERROR_MESSAGE = '여행 기록을 불러오지 못했어요';
const SECTION_GAP = 24;

// 기록이 없는 지역을 눌러도 아무 일도 없게 한다. 내 지도와 달리 기록 만들기
// 안내나 지역 정보 페이지 이동을 쓸 수 없다. 참조가 고정되도록 밖에 둔다.
const ignoreRegionWithoutRecord = () => {};

interface FriendTravelMapTabProps {
  friendUserId: number;
  /** 지도 제목과 부제에 쓰는 친구 이름. */
  nickname: string;
  scale: number;
}

/**
 * 친구의 여행 지도. 지도와 사진 채우기는 내 지도와 같은 Map을 쓰고, 블러 여부는
 * 서버의 blurred 값만 따른다(공개범위로 추정하지 않는다). 지도 사진을 누르면
 * 그 기록으로, 블러 지역은 이동하지 않는다.
 */
function FriendTravelMapTab({
  friendUserId,
  nickname,
  scale,
}: FriendTravelMapTabProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const yearsQuery = useFriendTravelMapYears(friendUserId);
  // 목록에서 사라진 연도를 가리키고 있으면 전체로 돌아간다.
  const year =
    selectedYear !== null && yearsQuery.years.includes(selectedYear)
      ? selectedYear
      : null;
  const { items, isPending, isError, retry } = useFriendTravelMap(
    friendUserId,
    year
  );
  const records = useMemo(
    () => items.map(normalizeFriendTravelMapItem),
    [items]
  );
  // 지역 이름 보충은 지도를 보여 주는 데 필수가 아니라서 실패해도 막지 않는다.
  const regionDetails = useTravelRecordRegionDetailsState(
    getUnresolvedFriendMapRegionIds(records)
  );
  const regionPhotos = useMemo(
    () =>
      toRegionPhotoMap(
        toFriendRegionPhotoRecords(records, (regionId) =>
          regionDetails.data.get(regionId)
        )
      ),
    [records, regionDetails.data]
  );

  let panel;

  if (isPending || regionDetails.isPending) {
    panel = (
      <section
        aria-label="여행 지도 불러오는 중"
        aria-busy="true"
        className="flex h-[596px] flex-col items-center justify-center gap-3 rounded-xl bg-white"
      >
        <LoadingSpinner label="여행 기록을 불러오는 중" />
        <p className="text-gray-4 text-sm">여행 기록을 불러오고 있어요</p>
      </section>
    );
  } else if (isError) {
    panel = (
      <section
        role="alert"
        className="mt-[42px] flex flex-col items-center gap-4 text-center"
      >
        <p className="text-gray-4 text-[16px] leading-[22px] font-medium">
          {LOAD_ERROR_MESSAGE}
        </p>
        <button
          type="button"
          onClick={retry}
          className="rounded-full border border-[#e4e4e4] px-4 py-2 text-[14px] font-medium text-[#505050]"
        >
          다시 시도
        </button>
      </section>
    );
  } else {
    panel = (
      <section
        aria-label="여행 지도"
        className="relative h-[596px] overflow-hidden rounded-xl bg-white"
      >
        <div className="absolute top-4 left-4 z-10">
          <h2 className="text-[18px] leading-none font-semibold text-black">
            {nickname}의 전국 지도
          </h2>
          <p className="text-gray-3 mt-2 text-[10px] leading-none font-normal">
            {nickname}님이 다녀온 지역을 확인해 보세요
          </p>
        </div>

        <div className="absolute inset-0 pt-[55px]">
          <Map
            baseScale={1.62}
            labelBaseScale={2.5}
            minZoom={0.8}
            initialZoom={0.9}
            regionPhotos={regionPhotos}
            onRegionWithoutRecordSelect={ignoreRegionWithoutRecord}
          />
        </div>

        {records.length === 0 ? (
          <p
            role="status"
            className="text-gray-4 pointer-events-none absolute bottom-4 left-4 z-10 text-sm font-medium"
          >
            {EMPTY_MESSAGE}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: SECTION_GAP * scale }}>
      {yearsQuery.years.length > 0 ? (
        <div>
          <TravelYearDropdown
            value={year}
            years={yearsQuery.years}
            onChange={setSelectedYear}
            onSelectAll={() => setSelectedYear(null)}
          />
        </div>
      ) : yearsQuery.isPending ? (
        <div>
          <TravelYearDropdownSkeleton />
        </div>
      ) : null}
      {panel}
    </div>
  );
}

export default FriendTravelMapTab;
