import { Map } from '../map/components';
import {
  getTravelRecordFoldersFromSummaries,
  useTravelRecordsForMap,
} from '../../../hooks/useTravelRecords';
import { useTravelRecordRegionDetails } from '../../../hooks/useTravelRecordRegions';
import { getTravelRecordRegionPhotoRecords } from '../../travel-record/utils/regionPhotoRecords';
import { toRegionPhotoMap } from '../map/types/regionPhoto';

function MapSection() {
  const { records, isError, retry } = useTravelRecordsForMap();
  const regionInfoByRegionId = useTravelRecordRegionDetails(
    records.map((record) => record.regionId)
  );
  const travelRecordFolders = getTravelRecordFoldersFromSummaries(
    records,
    regionInfoByRegionId
  );
  const regionPhotos = toRegionPhotoMap(
    getTravelRecordRegionPhotoRecords(travelRecordFolders)
  );

  return (
    <section className="mx-6 mt-4">
      <div className="relative h-[342px] overflow-hidden rounded-xl bg-[#F9F9F9]">
        <div className="h-full w-full">
          {/* 여행 기록 지도(TravelMapPanel) 축척을 기준으로 홈 카드 높이에
              맞춰 조금 키운 값. 기본값(2.5)은 확대가 심해 전국이 크게 잘린다.
              labelBaseScale은 그대로 둬서 지역명 크기는 유지한다. */}
          <Map
            baseScale={1.62}
            labelBaseScale={2.5}
            minZoom={0.8}
            initialZoom={0.9781}
            regionPhotos={regionPhotos}
          />
        </div>

        <h2 className="absolute top-4 left-4 text-[18px] leading-[100%] font-semibold text-[#1C1C1C]">
          기록 지도
        </h2>

        <p className="absolute top-[41px] left-4 text-[10px] leading-[100%] font-normal text-[#7F7F7F]">
          다녀온 지역을 한눈에 확인해 보세요
        </p>

        {isError ? (
          <div
            role="alert"
            className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-lg bg-white/95 px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
          >
            <p className="text-[12px] leading-[16px] text-[#7F7F7F]">
              여행 기록을 불러오지 못해 사진을 표시하지 못했어요
            </p>
            <button
              type="button"
              onClick={retry}
              className="shrink-0 rounded-full border border-[#e4e4e4] px-2.5 py-1 text-[12px] font-medium text-[#505050]"
            >
              다시 시도
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default MapSection;
