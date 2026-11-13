import { useParams } from 'react-router-dom';

import { ConfirmDialog, ReviewActionMenu } from '../../../components/common';
import {
  ResponsiveFullBleed,
  ResponsivePageShell,
} from '../../../components/layout/ResponsivePageShell';
import BaseKakaoMap from '../../../components/kakaomap/BaseKakaoMap';
import { isValidGeoPoint } from '../../../components/kakaomap/types';
import { openKakaoMapRoute } from '../../../components/kakaomap/utils/kakaoMapLink';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

import BackButton from '../../local-recommendation/components/BackButton';
import {
  DetailDescriptionCard,
  DetailInfoCard,
  DetailPlaceCard,
  DetailStateGuard,
  DetailTitleSection,
  FavoriteButton,
  ShareButton,
  ShareToast,
} from '../components';
import { toSafeExternalUrl, toTelHref } from '../mappers/festivalDetailMapper';

import DetailHeroCarousel from './components/DetailHeroCarousel';
import { useLocalBusinessDetail } from './hooks/useLocalBusinessDetail';

const PAGE_PADDING_BOTTOM = 32;
const BACK_BUTTON_TOP = 12;
const BACK_BUTTON_LEFT = 24;
const TITLE_SECTION_PADDING_TOP = 24;
const DESCRIPTION_MARGIN_TOP = 12;
const INFO_CARD_MARGIN_TOP = 12;
const MAP_MARGIN_TOP = 12;
const PLACE_CARD_MARGIN_TOP = 8;
const MAP_FALLBACK_HEIGHT = 342;
const MAP_FALLBACK_RADIUS = 12;
const MAP_FALLBACK_FONT_SIZE = 14;
const DESCRIPTION_TITLE = '우리 가게를 소개해요';

function LocalBusinessDetailContent({ promotionId }: { promotionId: number }) {
  const scale = useGlobalScale();
  const {
    business,
    errorMessage,
    likedOverride,
    handleFavoriteToggle,
    focusedPlaceLocation,
    setFocusedPlaceLocation,
    copied,
    isToastVisible,
    handleShare,
    requestPromotionDelete,
    promotionDeleteDialogProps,
    handleBack,
    editPromotion,
  } = useLocalBusinessDetail(promotionId);

  return (
    <>
      <DetailStateGuard error={errorMessage} data={business}>
        {(businessDetail) => (
          <ResponsivePageShell
            mode="main-layout"
            bottomPadding={PAGE_PADDING_BOTTOM}
            className="bg-white"
          >
            <ResponsiveFullBleed>
              <div className="relative">
                <DetailHeroCarousel
                  imageUrls={businessDetail.heroImageUrls}
                  title={businessDetail.title}
                  rightAction={
                    businessDetail.isMine ? (
                      <ReviewActionMenu
                        onEditClick={() => editPromotion(businessDetail.id)}
                        onDeleteClick={() =>
                          requestPromotionDelete(businessDetail.id)
                        }
                        triggerClassName=""
                        triggerSize={28}
                        ariaLabel="홍보글 메뉴"
                      />
                    ) : (
                      <FavoriteButton
                        isActive={likedOverride ?? businessDetail.liked}
                        label={businessDetail.title}
                        onClick={() => void handleFavoriteToggle()}
                      />
                    )
                  }
                />
                <div
                  className="absolute z-10"
                  style={{
                    top: BACK_BUTTON_TOP * scale,
                    left: BACK_BUTTON_LEFT * scale,
                  }}
                >
                  <BackButton onClick={handleBack} />
                </div>
              </div>
            </ResponsiveFullBleed>

            <div style={{ paddingTop: TITLE_SECTION_PADDING_TOP * scale }}>
              <DetailTitleSection
                title={businessDetail.title}
                tags={businessDetail.tags}
                action={
                  <ShareButton
                    onClick={handleShare}
                    label={`${businessDetail.title} 공유하기`}
                  />
                }
              />
            </div>

            <ShareToast copied={copied} isToastVisible={isToastVisible} />

            <section style={{ marginTop: DESCRIPTION_MARGIN_TOP * scale }}>
              <DetailDescriptionCard
                title={DESCRIPTION_TITLE}
                content={businessDetail.overview}
              />
            </section>

            <section style={{ marginTop: INFO_CARD_MARGIN_TOP * scale }}>
              <DetailInfoCard
                address={businessDetail.address}
                hours={businessDetail.hours}
                operatingDays={businessDetail.operatingDays}
                phone={businessDetail.phone}
                website={businessDetail.snsAccount}
                phoneHref={toTelHref(businessDetail.phone)}
                websiteHref={toSafeExternalUrl(businessDetail.snsAccount)}
              />
            </section>

            <div style={{ marginTop: MAP_MARGIN_TOP * scale }}>
              {businessDetail.location ? (
                <BaseKakaoMap
                  center={businessDetail.location}
                  markers={[businessDetail.location]}
                  imageMarkers={
                    businessDetail.heroImageUrl
                      ? [
                          {
                            location: businessDetail.location,
                            imageUrl: businessDetail.heroImageUrl,
                          },
                        ]
                      : []
                  }
                  focusedLocation={focusedPlaceLocation}
                  onMarkerClick={() =>
                    openKakaoMapRoute(
                      businessDetail.title,
                      businessDetail.location
                    )
                  }
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
                  등록된 위치 정보가 없습니다.
                </div>
              )}
            </div>

            <div style={{ marginTop: PLACE_CARD_MARGIN_TOP * scale }}>
              <DetailPlaceCard
                title={businessDetail.title}
                address={businessDetail.address}
                hours={businessDetail.hours}
                operatingDays={businessDetail.operatingDays}
                liked={likedOverride ?? businessDetail.liked}
                onLikeClick={() => void handleFavoriteToggle()}
                onClick={
                  isValidGeoPoint(businessDetail.location)
                    ? () => {
                        const location = businessDetail.location;
                        if (isValidGeoPoint(location)) {
                          setFocusedPlaceLocation({ ...location });
                        }
                      }
                    : undefined
                }
              />
            </div>
          </ResponsivePageShell>
        )}
      </DetailStateGuard>

      <ConfirmDialog
        {...promotionDeleteDialogProps}
        title="홍보글을 삭제할까요?"
        description="삭제한 홍보글은 되돌릴 수 없어요."
      />
    </>
  );
}

/**
 * 라우트 파라미터만 바뀌면 리액트 라우터가 컴포넌트를 언마운트하지 않으므로,
 * key 로 강제 리마운트해 좋아요/토스트 상태가 이전 업체에 남지 않게 한다.
 */
function LocalBusinessDetailPage() {
  const { id } = useParams<{ id?: string }>();
  const promotionId = Number(id);

  return (
    <LocalBusinessDetailContent
      key={id ?? 'default'}
      promotionId={promotionId}
    />
  );
}

export default LocalBusinessDetailPage;
