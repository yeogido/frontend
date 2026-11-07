import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ConfirmDialog } from '../../../components/common';
import uploadIcon from '../../../assets/icons/upload.svg';
import Map from '../../home/map/components/Map';
import { toRegionPhotoMap } from '../../home/map/types/regionPhoto';

import type { TravelRecordFolder } from '../types';
import { getTravelRecordRegionPhotoRecords } from '../utils/regionPhotoRecords';
import TravelMapShareModal from './TravelMapShareModal';

interface TravelMapPanelProps {
  folders: readonly TravelRecordFolder[];
}

const mapPanelLabel = '여행 지도';
const mapTitle = '전국 지도';
const mapDescription = '다녀온 지역을 한눈에 확인해 보세요';

function TravelMapPanel({ folders }: TravelMapPanelProps) {
  const navigate = useNavigate();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const closeShareModal = useCallback(() => setIsShareModalOpen(false), []);
  const [emptyRegionName, setEmptyRegionName] = useState<string | null>(null);
  const regionPhotos = toRegionPhotoMap(
    getTravelRecordRegionPhotoRecords(folders)
  );

  return (
    <section
      aria-label={mapPanelLabel}
      className="relative mt-7 h-[596px] overflow-hidden rounded-xl bg-white"
    >
      <div className="absolute top-4 left-4 z-10">
        <h2 className="text-[18px] leading-none font-semibold text-black">
          {mapTitle}
        </h2>
        <p className="text-gray-3 mt-2 text-[10px] leading-none font-normal">
          {mapDescription}
        </p>
      </div>

      <button
        type="button"
        aria-label="여행 지도 공유하기"
        onClick={() => setIsShareModalOpen(true)}
        className="focus-visible:outline-main-5 absolute top-[11px] right-3 z-10 flex size-8 cursor-pointer items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <span
          aria-hidden="true"
          className="size-6 bg-[#7f7f7f]"
          style={{
            maskImage: `url("${uploadIcon}")`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
          }}
        />
      </button>

      <div className="absolute inset-0 pt-[55px]">
        {/* 이 지도는 다녀온 곳을 모아 보는 자리라, 기록이 없는 지역을 눌렀을
            때 지역 정보 페이지로 보내지 않고 기록을 만들도록 안내한다. */}
        <Map
          baseScale={1.62}
          labelBaseScale={2.5}
          minZoom={0.8}
          initialZoom={0.9}
          regionPhotos={regionPhotos}
          onRegionWithoutRecordSelect={setEmptyRegionName}
        />
      </div>

      {isShareModalOpen && (
        <TravelMapShareModal
          regionPhotos={regionPhotos}
          onClose={closeShareModal}
        />
      )}

      <ConfirmDialog
        isOpen={emptyRegionName !== null}
        title="아직 여기엔 기록이 없어요"
        description={`${emptyRegionName ?? ''}에서의 여행을\n폴더로 만들어 지도에 남겨보세요.`}
        cancelLabel="닫기"
        confirmLabel="기록 만들기"
        onCancel={() => setEmptyRegionName(null)}
        onConfirm={() => {
          setEmptyRegionName(null);
          navigate('/travel-record/new');
        }}
      />
    </section>
  );
}

export default TravelMapPanel;
