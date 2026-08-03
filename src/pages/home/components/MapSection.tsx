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
    records.map((record) => record.regionId),
  );
  const travelRecordFolders = getTravelRecordFoldersFromSummaries(
    records,
    regionInfoByRegionId,
  );
  const regionPhotos = toRegionPhotoMap(
    getTravelRecordRegionPhotoRecords(travelRecordFolders),
  );

  return (
    <section className="mx-6 mt-4">
      <div className="relative h-[342px] overflow-hidden rounded-xl bg-[#F9F9F9]">
        <div className="h-full w-full">
          <Map regionPhotos={regionPhotos} />
        </div>

        <h2 className="absolute left-4 top-4 text-[18px] font-semibold leading-[100%] text-[#1C1C1C]">
          전국 지도
        </h2>

        <p className="absolute left-4 top-[41px] text-[10px] font-normal leading-[100%] text-[#7F7F7F]">
          지역을 클릭해서
          <br />
          다양한 정보를 확인해 보세요!
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
