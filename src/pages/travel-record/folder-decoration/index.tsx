import { useEffect, useMemo, useRef, useState } from 'react';
import { IoChevronBack } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';

import { TravelFolderArtwork, TravelRecordPageFrame } from '../components';
import type { TravelFolderDecorationLocationState } from '../photo-selection/types';
import {
  getTravelRecordDraftDateRange,
  getTravelRecordDraftRegion,
} from '../utils/draftStorage';
import {
  clearTravelRecordPhotoDraft,
  createTravelRecordDraftPayload,
  getTravelRecordPhotoDraft,
  saveTravelRecord,
} from '../utils/travelRecordSave';

const previousPageLabel =
  '\uC774\uC804 \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30';
const titleFirstLine = '\uC5EC\uD589 \uD3F4\uB354\uB97C';
const titleSecondLine =
  '\uB354 \uD2B9\uBCC4\uD558\uAC8C \uAFB8\uBA70\uBCF4\uC138\uC694';
const description =
  '\uC2A4\uD2F0\uCEE4\uB97C \uCD94\uAC00\uD574 \uB098\uB9CC\uC758 \uD3F4\uB354\uB97C \uB9CC\uB4E4\uC5B4 \uBCF4\uC138\uC694. (\uC120\uD0DD)';
const saveRecordLabel = '\uAE30\uB85D \uC800\uC7A5\uD558\uAE30';

const createObjectUrls = (files: File[]) =>
  files.slice(0, 2).map((file) => URL.createObjectURL(file));

const formatPeriod = (startDate: Date, endDate: Date) => {
  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${month}.${day}`;
  };

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

function TravelRecordFolderDecorationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState =
    location.state as TravelFolderDecorationLocationState | null;
  const storedSelectedRegion = useMemo(() => getTravelRecordDraftRegion(), []);
  const storedSelectedDateRange = useMemo(
    () => getTravelRecordDraftDateRange(),
    []
  );
  const selectedRegion = locationState?.selectedRegion ?? storedSelectedRegion;
  const selectedDateRange =
    locationState?.selectedDateRange ?? storedSelectedDateRange;
  const previewPhotoUrlsRef = useRef<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<File[] | null>(null);
  const [previewPhotoUrls, setPreviewPhotoUrls] = useState<string[]>([]);
  const isSavingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const folderPhotos = useMemo<[string, string] | null>(() => {
    const firstPhoto = previewPhotoUrls[0];

    if (!firstPhoto) {
      return null;
    }

    return [firstPhoto, previewPhotoUrls[1] ?? firstPhoto];
  }, [previewPhotoUrls]);
  const regionName =
    selectedRegion?.selectionName ?? selectedRegion?.name ?? '';
  const periodLabel = selectedDateRange
    ? formatPeriod(selectedDateRange.startDate, selectedDateRange.endDate)
    : '';

  useEffect(() => {
    let isMounted = true;
    let previewPhotoUrls: string[] = [];

    void getTravelRecordPhotoDraft()
      .then((photos) => {
        previewPhotoUrls = createObjectUrls(photos);

        if (!isMounted) {
          previewPhotoUrls.forEach((url) => URL.revokeObjectURL(url));
          return;
        }

        previewPhotoUrlsRef.current = previewPhotoUrls;
        setSelectedPhotos(photos);
        setPreviewPhotoUrls(previewPhotoUrls);
      })
      .catch(() => {
        if (isMounted) {
          setSelectedPhotos([]);
        }
      });

    return () => {
      isMounted = false;
      previewPhotoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleSaveRecord = async () => {
    if (
      isSavingRef.current ||
      !selectedRegion ||
      !selectedDateRange ||
      !selectedPhotos ||
      selectedPhotos.length === 0
    ) {
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const payload = createTravelRecordDraftPayload({
        selectedRegion,
        selectedDateRange,
        selectedPhotos,
      });
      await saveTravelRecord(payload);
      await clearTravelRecordPhotoDraft();
      navigate('/travel-record');
    } catch {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!selectedRegion) {
      navigate('/travel-record/new', { replace: true });
      return;
    }

    if (!selectedDateRange) {
      navigate('/travel-record/date-selection', { replace: true });
      return;
    }

    if (selectedPhotos !== null && selectedPhotos.length === 0) {
      navigate('/travel-record/photo-selection', { replace: true });
    }
  }, [navigate, selectedDateRange, selectedPhotos, selectedRegion]);

  return (
    <TravelRecordPageFrame className="bg-[#f9f9f9]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label={previousPageLabel}
        className="absolute top-[60px] left-6 flex size-6 items-center justify-start text-[#505050]"
      >
        <IoChevronBack aria-hidden="true" className="text-[24px]" />
      </button>

      <section className="absolute top-[100px] left-6 flex flex-col gap-3 text-[#1c1c1c]">
        <h1 className="text-[32px] leading-[1.18] font-semibold">
          {titleFirstLine}
          <br />
          {titleSecondLine}
        </h1>
        <p className="text-[14px] leading-none">{description}</p>
      </section>

      {folderPhotos ? (
        <section
          aria-label={`${regionName} \uC5EC\uD589 \uD3F4\uB354 \uBBF8\uB9AC\uBCF4\uAE30`}
          className="absolute top-[237px] left-1/2 flex w-[159px] -translate-x-1/2 flex-col items-center"
        >
          <TravelFolderArtwork photos={folderPhotos} title={regionName} />
          <h2 className="mt-3 text-center text-[16px] leading-none font-medium text-[#1c1c1c]">
            {regionName}
          </h2>
          <time className="mt-1.5 rounded-full bg-[#e4e4e4] px-2 py-1 text-[14px] leading-none font-normal text-[#7f7f7f]">
            {periodLabel}
          </time>
        </section>
      ) : null}

      <section className="absolute top-[503px] left-0 h-[341px] w-full bg-[#f9f9f9] shadow-[0_-1px_5px_rgba(0,0,0,0.07)]">
        <div className="absolute top-7 left-1/2 grid w-[344px] -translate-x-1/2 grid-cols-5 gap-4">
          {Array.from({ length: 15 }).map((_, index) => (
            <button
              key={`sticker-slot-${index}`}
              type="button"
              aria-label={`\uC2A4\uD2F0\uCEE4 ${index + 1}`}
              className="size-14 rounded-xl bg-[#e4e4e4]"
            />
          ))}
        </div>

        <button
          type="button"
          disabled={isSaving || !selectedPhotos?.length}
          aria-busy={isSaving}
          onClick={handleSaveRecord}
          className="absolute bottom-8 left-6 flex h-[53px] w-[342px] items-center justify-center rounded-xl bg-[#ff6f41] text-[18px] leading-none font-semibold text-[#f9f9f9] disabled:cursor-default disabled:bg-[#e4e4e4] disabled:text-[#7f7f7f]"
        >
          {saveRecordLabel}
        </button>
      </section>
    </TravelRecordPageFrame>
  );
}

export default TravelRecordFolderDecorationPage;
