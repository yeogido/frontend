import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  KeywordSelectionSection,
  RepresentativePhotoSection,
} from './components';
import { completeTagSelection } from './navigation';
import type { PhotoSelection, TagId, TagSelectionResult } from './types';
import { isTagSelectionReady, toggleTag } from './utils';

interface TagSelectionPageProps {
  onComplete?: (result: TagSelectionResult) => void;
}

function TagSelectionPage({ onComplete }: TagSelectionPageProps) {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<PhotoSelection | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<TagId>>(new Set());
  const [limitMessage, setLimitMessage] = useState('');

  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo.previewUrl);
    },
    [photo]
  );

  const handlePhotoChange = (file: File | null) => {
    setPhoto(file ? { file, previewUrl: URL.createObjectURL(file) } : null);
  };

  const handleTagToggle = (tagId: TagId) => {
    const result = toggleTag(selectedTagIds, tagId);
    setSelectedTagIds(result.selectedTagIds);
    setLimitMessage(
      result.limitReached ? '키워드는 최대 5개까지 선택할 수 있어요.' : ''
    );
  };

  const isReady = isTagSelectionReady(photo, selectedTagIds);

  const handleComplete = () => {
    if (!photo || !isReady) return;

    completeTagSelection({
      photo,
      selectedTagIds,
      onComplete,
      navigate,
    });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white px-6 pt-12 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <main className="flex-1">
        <h1 className="text-[28px] leading-[1.3] font-bold">
          사진과 키워드를
          <br />
          추가해 주세요
        </h1>
        <p className="text-gray-5 mt-3 text-sm">
          코스를 더 매력적으로 소개할 수 있어요!
        </p>

        <RepresentativePhotoSection
          photo={photo}
          onPhotoChange={handlePhotoChange}
        />
        <KeywordSelectionSection
          selectedTagIds={selectedTagIds}
          limitMessage={limitMessage}
          onToggle={handleTagToggle}
        />
      </main>

      <button
        type="button"
        disabled={!isReady}
        onClick={handleComplete}
        className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 mt-8 h-[53px] w-full shrink-0 rounded-xl text-sm font-semibold"
      >
        코스 선택하기
      </button>
    </div>
  );
}

export default TagSelectionPage;
