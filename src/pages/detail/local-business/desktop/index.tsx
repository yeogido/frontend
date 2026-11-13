import { useParams } from 'react-router-dom';
import {
  MdAccessTimeFilled,
  MdLocationOn,
  MdPhone,
  MdPublic,
} from 'react-icons/md';

import { ConfirmDialog } from '../../../../components/common';
import BaseKakaoMap from '../../../../components/kakaomap/BaseKakaoMap';
import { isValidGeoPoint } from '../../../../components/kakaomap/types';
import { openKakaoMapRoute } from '../../../../components/kakaomap/utils/kakaoMapLink';
import DesktopPageShell from '../../../../components/layout/desktop/DesktopPageShell';
import { ShareToast } from '../../components';
import DetailDesktopLayout, {
  type DetailInfoRow,
} from '../../desktop/DetailDesktopLayout';
import DetailTitleActions from '../../desktop/DetailTitleActions';
import {
  toSafeExternalUrl,
  toTelHref,
} from '../../mappers/festivalDetailMapper';
import { useLocalBusinessDetail } from '../hooks/useLocalBusinessDetail';

function LocalBusinessDetailDesktopContent({
  promotionId,
}: {
  promotionId: number;
}) {
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
    editPromotion,
  } = useLocalBusinessDetail(promotionId);

  if (errorMessage || !business) {
    return (
      <DesktopPageShell>
        <p
          role={errorMessage ? 'alert' : 'status'}
          className="text-gray-4 py-[120px] text-center text-[18px]"
        >
          {errorMessage ?? '불러오는 중...'}
        </p>
      </DesktopPageShell>
    );
  }

  const liked = likedOverride ?? business.liked;

  const infoRows: DetailInfoRow[] = [
    { icon: MdLocationOn, text: business.address },
    { icon: MdAccessTimeFilled, text: business.hours },
    {
      icon: MdPhone,
      text: business.phone,
      href: toTelHref(business.phone),
    },
    {
      icon: MdPublic,
      text: business.snsAccount,
      href: toSafeExternalUrl(business.snsAccount),
    },
  ].filter((row) => row.text !== '');

  return (
    <>
      <DetailDesktopLayout
        heroImageUrls={
          business.heroImageUrls.length > 0
            ? business.heroImageUrls
            : business.heroImageUrl
              ? [business.heroImageUrl]
              : []
        }
        title={business.title}
        overview={business.overview}
        tags={business.tags}
        titleActions={
          <DetailTitleActions
            manage={
              business.isMine
                ? {
                    label: '홍보글 메뉴',
                    onEdit: () => editPromotion(business.id),
                    onDelete: () => requestPromotionDelete(business.id),
                  }
                : undefined
            }
            like={
              business.isMine
                ? undefined
                : {
                    active: liked,
                    label: business.title,
                    onClick: () => void handleFavoriteToggle(),
                  }
            }
            shareLabel={`${business.title} 공유하기`}
            onShare={handleShare}
          />
        }
        infoRows={infoRows}
        map={
          business.location ? (
            <BaseKakaoMap
              center={business.location}
              markers={[business.location]}
              imageMarkers={
                business.heroImageUrl
                  ? [
                      {
                        location: business.location,
                        imageUrl: business.heroImageUrl,
                      },
                    ]
                  : []
              }
              focusedLocation={focusedPlaceLocation}
              onMarkerClick={() =>
                openKakaoMapRoute(business.title, business.location)
              }
            />
          ) : (
            <div
              role="status"
              className="bg-gray-2 text-gray-4 flex h-[424px] w-full items-center justify-center rounded-[24px] text-[16px]"
            >
              등록된 위치 정보가 없습니다.
            </div>
          )
        }
        place={{
          name: business.title,
          address: business.address,
          hours: business.hours,
          liked,
          onLikeClick: () => void handleFavoriteToggle(),
          onClick: isValidGeoPoint(business.location)
            ? () => {
                const location = business.location;
                if (isValidGeoPoint(location)) {
                  setFocusedPlaceLocation({ ...location });
                }
              }
            : undefined,
        }}
      />

      <ShareToast copied={copied} isToastVisible={isToastVisible} />
      <ConfirmDialog
        {...promotionDeleteDialogProps}
        title="홍보글을 삭제할까요?"
        description="삭제한 홍보글은 되돌릴 수 없어요."
      />
    </>
  );
}

/** 소상공인 홍보 상세의 데스크톱 뷰. 라우트 파라미터가 바뀌면 상태가 남지 않게 key로 다시 마운트한다. */
function LocalBusinessDetailDesktopPage() {
  const { id } = useParams<{ id?: string }>();
  const promotionId = Number(id);

  return (
    <LocalBusinessDetailDesktopContent
      key={id ?? 'default'}
      promotionId={promotionId}
    />
  );
}

export default LocalBusinessDetailDesktopPage;
