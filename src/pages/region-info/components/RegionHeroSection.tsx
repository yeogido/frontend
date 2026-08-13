import { useState } from 'react';

import { RegionHero, RegionHeroSkeleton } from '../../../components/common';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

import type { RegionInfo } from '../constants/types';

const PAGE_PADDING_X = 24;
const TITLE_FONT_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;

const DESCRIPTION_MARGIN_TOP = 5;
const DESCRIPTION_FONT_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 17;

const HERO_MARGIN_TOP = 12;
const ERROR_TEXT_SIZE = 13;
const ERROR_GAP = 12;
const RETRY_BUTTON_FONT_SIZE = 14;
const RETRY_BUTTON_PADDING_X = 16;
const RETRY_BUTTON_PADDING_Y = 8;

interface RegionHeroSectionProps {
  regionInfo: RegionInfo;
  heroImageUrl?: string;
  heroDescription?: string;
  isImageLoading: boolean;
  isImageError: boolean;
  onRetryImage: () => void;
}

function RegionHeroSection({
  regionInfo,
  heroImageUrl,
  heroDescription,
  isImageLoading,
  isImageError,
  onRetryImage,
}: RegionHeroSectionProps) {
  const scale = useGlobalScale();
  const [failedImageUrl, setFailedImageUrl] = useState<string>();

  const hasImageLoadError =
    heroImageUrl !== undefined && failedImageUrl === heroImageUrl;
  const showError = isImageError || !heroImageUrl || hasImageLoadError;

  const handleRetry = () => {
    setFailedImageUrl(undefined);
    onRetryImage();
  };

  return (
    <>
      <div
        style={{
          paddingLeft: PAGE_PADDING_X * scale,
          paddingRight: PAGE_PADDING_X * scale,
        }}
      >
        <h1
          className="font-semibold text-black"
          style={{
            fontSize: TITLE_FONT_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          {regionInfo.displayName}의 코스와 장소
        </h1>

        <p
          className="text-gray-4 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_FONT_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          {regionInfo.description}
        </p>
      </div>

      <div
        style={{
          marginTop: HERO_MARGIN_TOP * scale,
          paddingLeft: PAGE_PADDING_X * scale,
          paddingRight: PAGE_PADDING_X * scale,
        }}
      >
        {isImageLoading ? (
          <RegionHeroSkeleton />
        ) : showError ? (
          <div
            className="flex aspect-[342/129] w-full flex-col items-center justify-center rounded-xl bg-[#F9F9F9]"
            style={{ gap: ERROR_GAP * scale }}
          >
            <p
              className="text-gray-5 text-center font-medium"
              style={{ fontSize: ERROR_TEXT_SIZE * scale }}
            >
              대표 이미지를 불러오지 못했어요.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-full border border-[#e4e4e4] bg-white font-medium text-[#505050]"
              style={{
                fontSize: RETRY_BUTTON_FONT_SIZE * scale,
                paddingLeft: RETRY_BUTTON_PADDING_X * scale,
                paddingRight: RETRY_BUTTON_PADDING_X * scale,
                paddingTop: RETRY_BUTTON_PADDING_Y * scale,
                paddingBottom: RETRY_BUTTON_PADDING_Y * scale,
              }}
            >
              다시 시도
            </button>
          </div>
        ) : (
          <RegionHero
            image={heroImageUrl}
            title={regionInfo.displayName}
            description={heroDescription ?? ''}
            alt={`${regionInfo.displayName} 대표 이미지`}
            onImageError={() => setFailedImageUrl(heroImageUrl)}
          />
        )}
      </div>
    </>
  );
}

export default RegionHeroSection;
