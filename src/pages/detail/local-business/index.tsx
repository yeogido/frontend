import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { addPlaceLike, removePlaceLike } from '../../../apis/courses';
import { getApiErrorMessage } from '../../../apis/common';
import type { NormalizedApiError } from '../../../apis/common';
import { ConfirmDialog, ReviewActionMenu } from '../../../components/common';
import {
  ResponsiveFullBleed,
  ResponsivePageShell,
} from '../../../components/layout/ResponsivePageShell';
import BaseKakaoMap from '../../../components/kakaomap/BaseKakaoMap';
import { isValidGeoPoint } from '../../../components/kakaomap/types';
import { openKakaoMapRoute } from '../../../components/kakaomap/utils/kakaoMapLink';
import { useToast } from '../../../components/toast';
import { useBusinessPromotionDelete } from '../../../hooks/useBusinessPromotions';
import { useBusinessPromotionDetail } from '../../../hooks/useBusinessPromotionDetail';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useAuthStore } from '../../../store/auth.store';
import { buildBusinessPromotionEditPath } from '../../../utils/routes';

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
import { useShareToast } from '../hooks/useShareToast';
import { mapBusinessPromotionDetail } from '../mappers/businessPromotionDetailMapper';
import { toSafeExternalUrl, toTelHref } from '../mappers/festivalDetailMapper';

import DetailHeroCarousel from './components/DetailHeroCarousel';

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
const NOT_FOUND_MESSAGE = '업체 정보를 불러오지 못했습니다.';

function isNormalizedApiError(error: unknown): error is NormalizedApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

function LocalBusinessDetailContent({ promotionId }: { promotionId: number }) {
  const scale = useGlobalScale();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { openLoginModal } = useLoginModal();
  const { showToast } = useToast();
  const isValidPromotionId = Number.isInteger(promotionId) && promotionId > 0;
  const { data: detailResponse, error: queryError } =
    useBusinessPromotionDetail(promotionId);
  const [likedOverride, setLikedOverride] = useState<boolean | null>(null);
  const placeLikeRequestInFlightRef = useRef(false);
  const { copied, isToastVisible, handleShare } = useShareToast();
  const {
    requestDelete: requestPromotionDelete,
    dialogProps: promotionDeleteDialogProps,
  } = useBusinessPromotionDelete(() => navigate('/local-business'));

  const business = detailResponse
    ? mapBusinessPromotionDetail(detailResponse)
    : null;

  const errorMessage = !isValidPromotionId
    ? NOT_FOUND_MESSAGE
    : queryError
      ? isNormalizedApiError(queryError)
        ? queryError.message
        : NOT_FOUND_MESSAGE
      : null;

  const handleFavoriteToggle = async () => {
    if (placeLikeRequestInFlightRef.current) return;

    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    if (!business) return;

    const nextLiked = !(likedOverride ?? business.liked);
    placeLikeRequestInFlightRef.current = true;
    setLikedOverride(nextLiked);

    try {
      if (nextLiked) {
        await addPlaceLike(business.placeId, 'PROMOTION', promotionId);
      } else {
        await removePlaceLike(business.placeId);
      }
    } catch (error) {
      setLikedOverride(!nextLiked);

      if (isNormalizedApiError(error) && error.code === 'AUTH4011') {
        clearAuth();
        openLoginModal();
        return;
      }

      showToast(
        getApiErrorMessage(error, '좋아요 처리에 실패했습니다. 잠시 후 다시 시도해주세요.')
      );
    } finally {
      placeLikeRequestInFlightRef.current = false;
    }
  };

  // festival/index.tsx의 handleBack과 동일한 패턴 — history.state.idx가
  // 0이면 이 탭에서 처음 들어온 화면(직접 링크 진입 등)이라 뒤로 갈 곳이
  // 없다, 그때만 목록으로 대체 이동한다.
  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/local-business');
    }
  };

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
                        onEditClick={() =>
                          navigate(
                            buildBusinessPromotionEditPath(businessDetail.id)
                          )
                        }
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
                imageUrl={businessDetail.heroImageUrl}
                title={businessDetail.title}
                address={businessDetail.address}
                hours={businessDetail.hours}
                liked={likedOverride ?? businessDetail.liked}
                onLikeClick={() => void handleFavoriteToggle()}
                onClick={
                  isValidGeoPoint(businessDetail.location)
                    ? () =>
                        openKakaoMapRoute(
                          businessDetail.title,
                          businessDetail.location
                        )
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
