import {
  RegionHero,
  RegionHeroSkeleton,
} from '../../../components/common';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

import type { RegionInfo } from '../constants/types';

const PAGE_PADDING_X = 24;
const TITLE_FONT_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;

const DESCRIPTION_MARGIN_TOP = 5;
const DESCRIPTION_FONT_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 17;

const HERO_MARGIN_TOP = 12;

interface RegionHeroSectionProps {
  regionInfo: RegionInfo;
}

function RegionHeroSection({
  regionInfo,
}: RegionHeroSectionProps) {
  const scale = useGlobalScale();

  const isLoading = false;
  // const isLoading = true;

  return (
    <>
      <div
        style={{
          paddingLeft: PAGE_PADDING_X * scale,
          paddingRight: PAGE_PADDING_X * scale,
        }}
      >
        {isLoading ? (
          <>
            <div
              className="animate-pulse rounded bg-[#EAEAEA]"
              style={{
                width: 180 * scale,
                height: TITLE_LINE_HEIGHT * scale,
              }}
            />

            <div
              className="animate-pulse rounded bg-[#EAEAEA]"
              style={{
                marginTop: DESCRIPTION_MARGIN_TOP * scale,
                width: 260 * scale,
                height: DESCRIPTION_LINE_HEIGHT * scale,
              }}
            />
          </>
        ) : (
          <>
            <h1
              className="font-semibold text-black"
              style={{
                fontSize: TITLE_FONT_SIZE * scale,
                lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
              }}
            >
              {regionInfo.name}의 코스와 장소
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
          </>
        )}
      </div>

      <div
        style={{
          marginTop: HERO_MARGIN_TOP * scale,
          paddingLeft: PAGE_PADDING_X * scale,
          paddingRight: PAGE_PADDING_X * scale,
        }}
      >
        {isLoading ? (
          <RegionHeroSkeleton />
        ) : (
          <RegionHero
            image={regionInfo.heroImage}
            title={`${regionInfo.name} 대표 이미지`}
            alt={`${regionInfo.name} 대표 이미지`}
          />
        )}
      </div>
    </>
  );
}

export default RegionHeroSection;