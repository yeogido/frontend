import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  IoBulb,
  IoCalendarOutline,
  IoChevronBack,
  IoImage,
  IoLocationSharp,
  IoPerson,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

import courseThumbnail from '../course-region-search/assets/cities/gangwon.webp';
import PhotoSlot from './components/PhotoSlot';
import RatingStars from './components/RatingStars';
import {
  appendSelectedReviewPhotos,
  getSelectedReviewPhotos,
  isReviewFormValid,
} from './reviewForm';

const PHOTO_SLOTS = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  label: `사진 ${index + 1} 추가`,
}));

function ReviewPage() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(3);
  const [review, setReview] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<
    Array<{ file: File; previewUrl: string }>
  >([]);
  const photoPickerRef = useRef<HTMLInputElement>(null);
  const selectedPhotosRef = useRef(selectedPhotos);
  const canSubmit = isReviewFormValid({ rating, review });

  useEffect(() => {
    selectedPhotosRef.current = selectedPhotos;
  }, [selectedPhotos]);

  useEffect(() => {
    return () => {
      selectedPhotosRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    };
  }, []);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = getSelectedReviewPhotos(event.currentTarget.files ?? []);
    setSelectedPhotos((currentPhotos) => {
      const mergedFiles = appendSelectedReviewPhotos(
        currentPhotos.map(({ file }) => file),
        files
      );
      const addedFiles = mergedFiles.slice(currentPhotos.length);

      return [
        ...currentPhotos,
        ...addedFiles.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
      ];
    });
    event.currentTarget.value = '';
  };

  const openPhotoPicker = () => photoPickerRef.current?.click();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;
  };

  return (
    <main className="relative z-[60] mx-auto -mt-14 min-h-dvh w-full max-w-[430px] bg-white px-6 pt-[59px] pb-8">
      <form onSubmit={handleSubmit}>
      <button
        type="button"
        aria-label="이전 페이지로 이동"
        onClick={() => navigate(-1)}
        className="text-gray-5 flex size-6 items-center justify-center"
      >
        <IoChevronBack aria-hidden="true" className="text-[24px]" />
      </button>

      <header className="mt-[17px]">
        <h1 className="text-[30px] leading-[1.25] font-bold tracking-[-0.03em]">
          이번 여행은
          <br />
          어떠셨나요?
        </h1>
        <p className="text-gray-5 mt-3 text-[13px] leading-[19px]">
          다른 여행자에게 도움이 되는 후기를 남겨보세요
        </p>
      </header>

      <section
        aria-label="리뷰할 코스"
        className="bg-background mt-[29px] flex min-h-[100px] items-center rounded-xl px-3 py-3"
      >
        <img
          src={courseThumbnail}
          alt="강릉 혼자 여행 코스"
          className="h-[76px] w-[103px] shrink-0 rounded-lg object-cover"
        />
        <div className="ml-3 min-w-0 flex-1">
          <h2 className="truncate text-[15px] leading-5 font-semibold tracking-[-0.02em]">
            강릉 혼자 여행 코스
          </h2>
          <div className="text-gray-4 mt-3 flex flex-wrap items-center gap-x-[9px] gap-y-1 text-[11px] leading-4">
            <span className="flex items-center gap-[3px] whitespace-nowrap">
              <IoCalendarOutline aria-hidden="true" className="text-[13px]" />
              2박 3일
            </span>
            <span className="flex items-center gap-[2px] whitespace-nowrap">
              <IoLocationSharp aria-hidden="true" className="text-[13px]" />
              뚜벅이 코스
            </span>
            <span className="flex items-center gap-[3px] whitespace-nowrap">
              <IoPerson aria-hidden="true" className="text-[12px]" />
              혼자
            </span>
          </div>
        </div>
      </section>

      <section className="mt-[31px]" aria-labelledby="photo-upload-title">
        <h2 id="photo-upload-title" className="text-base leading-6 font-semibold">
          후기 사진 등록
        </h2>
        <label className="border-main-5 bg-main-1 mt-[6px] flex h-[213px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed text-center">
          <input
            ref={photoPickerRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoChange}
            className="sr-only"
          />
          <span className="bg-main-3 flex size-[51px] items-center justify-center rounded-full">
            <IoImage aria-hidden="true" className="text-main-5 text-[27px]" />
          </span>
          <strong className="mt-[17px] text-sm leading-5 font-semibold">
            사진을 추가해 주세요.
          </strong>
          <span className="mt-[7px] text-xs leading-[18px]">
            여기를 탭해서 업로드할 수 있어요.
          </span>
        </label>
      </section>

      <section className="mt-[34px]" aria-labelledby="selected-photo-title">
        <div className="flex items-center justify-between">
          <h2 id="selected-photo-title" className="text-base leading-6 font-medium">
            선택된 사진 <span className="text-gray-4">({selectedPhotos.length}/5)</span>
          </h2>
          <p className="text-gray-3 text-[11px] leading-4">
            최대 5장까지 선택할 수 있어요.
          </p>
        </div>
        <div className="mt-[5px] grid grid-cols-5 gap-4">
          {PHOTO_SLOTS.map((slot, index) => (
            <PhotoSlot
              key={slot.id}
              label={slot.label}
              previewUrl={selectedPhotos[index]?.previewUrl}
              onClick={openPhotoPicker}
            />
          ))}
        </div>
      </section>

      <section className="mt-[31px]" aria-labelledby="rating-title">
        <h2 id="rating-title" className="text-base leading-6 font-semibold">
          별점을 남겨주세요
        </h2>
        <RatingStars value={rating} onChange={setRating} />
        <p className="text-gray-3 mt-[3px] text-[11px] leading-4">
          이 코스를 얼마나 만족하셨나요?
        </p>
      </section>

      <section className="mt-[31px]" aria-labelledby="review-title">
        <h2 id="review-title" className="text-base leading-6 font-semibold">
          총평을 남겨주세요
        </h2>
        <textarea
          value={review}
          maxLength={300}
          onChange={(event) => setReview(event.target.value)}
          aria-label="코스 총평"
          placeholder={'이 코스는 어땠나요?\n좋았던 점, 아쉬웠던 점을 자유롭게 작성해 주세요.'}
          className="border-gray-2 mt-[9px] h-[109px] w-full resize-none rounded-xl border bg-white px-3 py-3 text-xs leading-4 outline-none placeholder:text-gray-4 focus:border-main-5"
        />
      </section>

      <aside className="bg-main-2 text-main-5 mt-8 flex h-[62px] items-center rounded-xl px-[14px]">
        <span className="bg-main-5 flex size-7 shrink-0 items-center justify-center rounded-full text-white">
          <IoBulb aria-hidden="true" className="text-[17px]" />
        </span>
        <p className="ml-4 text-[11px] leading-[14px]">
          다른 여행자에게 도움이 되는 후기를 작성해 보세요!
          <br />
          솔직한 경험이 더 좋은 여행을 만들어줘요
        </p>
      </aside>

      <button
        type="submit"
        disabled={!canSubmit}
        className={`mt-[90px] h-[53px] w-full rounded-xl text-base font-semibold disabled:cursor-not-allowed ${
          canSubmit ? 'bg-main-5 text-white' : 'bg-gray-2 text-gray-4'
        }`}
      >
        후기 남기기
      </button>
      </form>
    </main>
  );
}

export default ReviewPage;
