import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BaseKakaoMap from '../../../../components/kakaomap/BaseKakaoMap';
import { isValidGeoPoint } from '../../../../components/kakaomap/types';
import {
  ResponsiveFullBleed,
  ResponsivePageShell,
} from '../../../../components/layout/ResponsivePageShell';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useAdminEventRegistrationStore } from '../../../../store/adminEventRegistration.store';

import {
  DetailDescriptionCard,
  DetailHeroSection,
  DetailInfoCard,
  DetailPlaceCard,
  DetailTitleSection,
  FavoriteButton,
  ShareButton,
  ShareToast,
} from '../../../detail/components';
import { toSafeExternalUrl, toTelHref } from '../../../detail/mappers/festivalDetailMapper';
import { useShareToast } from '../../../detail/hooks/useShareToast';
import { buildMockEventDetail } from '../mockEventDetail';

const PAGE_PADDING_BOTTOM = 32;
const TITLE_SECTION_PADDING_TOP = 15;
const TOP_BAR_HEIGHT = 44;
const SECTION_MARGIN_TOP = 16;
const INFO_CARD_MARGIN_TOP = 24;
const MAP_MARGIN_TOP = 24;
const PLACE_CARD_MARGIN_TOP = 4;
const MAP_FALLBACK_HEIGHT = 342;
const MAP_FALLBACK_RADIUS = 12;
const MAP_FALLBACK_FONT_SIZE = 14;

function AdminEventCompletePage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const place = useAdminEventRegistrationStore((state) => state.place);
  const basicInfo = useAdminEventRegistrationStore((state) => state.basicInfo);
  const photo = useAdminEventRegistrationStore((state) => state.photo);
  const keywordTagIds = useAdminEventRegistrationStore(
    (state) => state.keywordTagIds
  );
  const category = useAdminEventRegistrationStore((state) => state.category);
  const resetRegistration = useAdminEventRegistrationStore(
    (state) => state.reset
  );
  const [liked, setLiked] = useState(false);
  const { copied, isToastVisible, handleShare } = useShareToast();

  const isRegistrationComplete = Boolean(place && photo);

  useEffect(() => {
    if (!isRegistrationComplete) {
      navigate('/admin', { replace: true });
    }
  }, [isRegistrationComplete, navigate]);

  if (!place || !photo) return null;

  const festivalDetail = buildMockEventDetail({
    place,
    basicInfo,
    heroImageUrl: photo.previewUrl,
    keywordTagIds,
    category,
  });

  const handleGoToAdminHome = () => {
    resetRegistration();
    navigate('/admin');
  };

  return (
    <ResponsivePageShell
      mode="main-layout"
      bottomPadding={PAGE_PADDING_BOTTOM}
      className="bg-white"
    >
      <div
        className="flex shrink-0 items-center justify-between"
        style={{ height: TOP_BAR_HEIGHT * scale }}
      >
        <span
          className="text-main-5 font-semibold"
          style={{ fontSize: 14 * scale }}
        >
          여기도 추천 행사 등록 완료
        </span>
        <button
          type="button"
          onClick={handleGoToAdminHome}
          className="text-gray-5 font-medium underline"
          style={{ fontSize: 13 * scale }}
        >
          관리자 홈으로
        </button>
      </div>

      <ResponsiveFullBleed>
        <DetailHeroSection
          imageUrl={festivalDetail.heroImageUrl}
          title={festivalDetail.title}
          rightAction={
            <FavoriteButton
              isActive={liked}
              label={festivalDetail.title}
              onClick={() => setLiked((previous) => !previous)}
            />
          }
        />
      </ResponsiveFullBleed>

      <div style={{ paddingTop: TITLE_SECTION_PADDING_TOP * scale }}>
        <DetailTitleSection
          title={festivalDetail.title}
          tags={festivalDetail.tags}
          action={
            <ShareButton
              onClick={handleShare}
              label={`${festivalDetail.title} 공유하기`}
            />
          }
        />
      </div>

      <ShareToast copied={copied} isToastVisible={isToastVisible} />

      <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
        <DetailDescriptionCard
          title="행사 소개"
          content={festivalDetail.overview}
        />
      </section>

      <section style={{ marginTop: INFO_CARD_MARGIN_TOP * scale }}>
        <DetailInfoCard
          address={festivalDetail.address}
          hours={festivalDetail.period}
          phone={festivalDetail.phone}
          website={festivalDetail.homepageLabel}
          phoneHref={toTelHref(festivalDetail.phone)}
          websiteHref={toSafeExternalUrl(festivalDetail.homepageUrl)}
        />
      </section>

      <div style={{ marginTop: MAP_MARGIN_TOP * scale }}>
        {isValidGeoPoint(festivalDetail.place.location) ? (
          <BaseKakaoMap
            center={festivalDetail.place.location}
            markers={[festivalDetail.place.location]}
          />
        ) : (
          <div
            role="status"
            className="bg-gray-2 text-gray-4 flex w-full items-center justify-center"
            style={{
              height: MAP_FALLBACK_HEIGHT * scale,
              borderRadius: MAP_FALLBACK_RADIUS * scale,
              fontSize: MAP_FALLBACK_FONT_SIZE * scale,
            }}
          >
            등록된 행사 위치 정보가 없습니다.
          </div>
        )}
      </div>

      <div style={{ marginTop: PLACE_CARD_MARGIN_TOP * scale }}>
        <DetailPlaceCard
          imageUrl={festivalDetail.place.image}
          title={festivalDetail.place.name}
          address={festivalDetail.place.address}
          hours={festivalDetail.place.hours}
          liked={festivalDetail.place.liked}
        />
      </div>
    </ResponsivePageShell>
  );
}

export default AdminEventCompletePage;
