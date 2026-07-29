import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  DetailDescriptionCard,
  DetailHeroSection,
  DetailInfoCard,
  DetailPlaceCard,
  DetailTitleSection,
  ShareButton,
} from '../components';
import {
  ResponsiveFullBleed,
  ResponsivePageShell,
} from '../../../components/layout/ResponsivePageShell';
import BaseKakaoMap from '../../../components/kakaomap/BaseKakaoMap';
import type { DetailTag } from '../../../types/detail';
import { toSafeExternalUrl, toTelHref } from '../mappers/festivalDetailMapper';
import { localBusinessMockData } from '../../../apis/localBusiness';
import type { BusinessItem } from '../../local-business/types';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useAuthStore } from '../../../store/auth.store';
import { getGutter } from '../../../utils/responsiveLayout';

// Figma 390 디자인 기준 리터럴 px ("홍보 페이지 - 상세" 시안, 캔버스 390x1092)
const PAGE_PADDING_BOTTOM = 32;
const TITLE_SECTION_PADDING_TOP = 24;
const TOAST_BOTTOM = 84;
const TOAST_TEXT_PADDING_X = 16;
const TOAST_TEXT_PADDING_Y = 8;
const TOAST_TEXT_FONT_SIZE = 13;
const DESCRIPTION_MARGIN_TOP = 12;
const INFO_CARD_MARGIN_TOP = 12;
const MAP_MARGIN_TOP = 12;
const PLACE_CARD_MARGIN_TOP = 8;
const MAP_FALLBACK_HEIGHT = 342;
const MAP_FALLBACK_RADIUS = 12;
const MAP_FALLBACK_FONT_SIZE = 14;

// 로컬 비즈니스 상세 mock. BusinessItem에 없는 필드(영업시간/전화/홈페이지/좌표)는
// 실제 업체 상세 API가 아직 없어 화면 검증용으로 이 파일에서만 보강한다.
const MOCK_HOURS = '매일 10:00 - 24:00';
const MOCK_PHONE = '0507-1470-1661';
const MOCK_HOMEPAGE_LABEL = '@yeogido123';
const MOCK_HOMEPAGE_URL = 'https://www.instagram.com/yeogido123';
const MOCK_LOCATION = { latitude: 35.2432, longitude: 129.2247 };
const MOCK_DESCRIPTION_TITLE = '우리 가게를 소개해요';

const BUSINESS_TAG_ID_MAP: Record<string, string> = {
  summer: '여름',
  sea: '바다',
  cafe: '카페',
  bakery: '베이커리',
};

function toDetailTags(business: BusinessItem): readonly DetailTag[] {
  return business.tags.map((tagId) => ({
    id: tagId,
    tagId,
    label: BUSINESS_TAG_ID_MAP[tagId],
  }));
}

function LocalBusinessDetailContent({ businessId }: { businessId?: string }) {
  const scale = useGlobalScale();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();

  const business = useMemo<BusinessItem>(
    () =>
      localBusinessMockData.find((item) => item.id === businessId) ??
      localBusinessMockData[0],
    [businessId]
  );
  const tags = useMemo(() => toDetailTags(business), [business]);

  // 이 시안에는 히어로에 별도 좋아요 버튼이 없고, 하단 관련 매장 카드의
  // 하트 아이콘만 좋아요 액션을 담당한다.
  const [isPlaceLiked, setIsPlaceLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setIsToastVisible(true);
      fadeTimerRef.current = setTimeout(() => setIsToastVisible(false), 1600);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const runAuthAction = (action: () => void) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    action();
  };

  const handlePlaceLikeToggle = () => {
    runAuthAction(() => setIsPlaceLiked((prev) => !prev));
  };

  return (
    <ResponsivePageShell
      mode="main-layout"
      bottomPadding={PAGE_PADDING_BOTTOM}
      className="bg-white"
    >
      {/* 1. 히어로 영역 */}
      <ResponsiveFullBleed>
        <DetailHeroSection imageUrl={business.image} title={business.title} />
      </ResponsiveFullBleed>

      {/* 2. 제목 + 공유 버튼, 3. 카테고리 칩 */}
      <div style={{ paddingTop: TITLE_SECTION_PADDING_TOP * scale }}>
        <DetailTitleSection
          title={business.title}
          tags={tags}
          action={
            <ShareButton
              onClick={handleShare}
              label={`${business.title} 공유하기`}
            />
          }
        />
      </div>

      {copied && (
        <div
          className="pointer-events-none fixed bottom-0 left-1/2 z-[60] flex w-full max-w-[500px] -translate-x-1/2 justify-center"
          style={{
            bottom: `max(${TOAST_BOTTOM * scale}px, env(safe-area-inset-bottom, 0px))`,
            paddingLeft: getGutter(scale),
            paddingRight: getGutter(scale),
          }}
        >
          <span
            role="status"
            className={`bg-gray-800 text-center font-medium text-white shadow-lg transition-all duration-300 ${
              isToastVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              paddingLeft: TOAST_TEXT_PADDING_X * scale,
              paddingRight: TOAST_TEXT_PADDING_X * scale,
              paddingTop: TOAST_TEXT_PADDING_Y * scale,
              paddingBottom: TOAST_TEXT_PADDING_Y * scale,
              fontSize: TOAST_TEXT_FONT_SIZE * scale,
              borderRadius: 999 * scale,
            }}
          >
            복사 됨
          </span>
        </div>
      )}

      {/* 4. 가게 소개 */}
      <section style={{ marginTop: DESCRIPTION_MARGIN_TOP * scale }}>
        <DetailDescriptionCard
          title={MOCK_DESCRIPTION_TITLE}
          content={business.description}
        />
      </section>

      {/* 5. 업체 정보 (주소 / 영업시간 / 전화번호 / 홈페이지) */}
      <section style={{ marginTop: INFO_CARD_MARGIN_TOP * scale }}>
        <DetailInfoCard
          address={business.location}
          hours={MOCK_HOURS}
          phone={MOCK_PHONE}
          website={MOCK_HOMEPAGE_LABEL}
          phoneHref={toTelHref(MOCK_PHONE)}
          websiteHref={toSafeExternalUrl(MOCK_HOMEPAGE_URL)}
        />
      </section>

      {/* 6. 지도 */}
      <div style={{ marginTop: MAP_MARGIN_TOP * scale }}>
        {MOCK_LOCATION ? (
          <BaseKakaoMap center={MOCK_LOCATION} markers={[MOCK_LOCATION]} />
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

      {/* 7. 관련 매장 카드 (좋아요 액션 포함) */}
      <div style={{ marginTop: PLACE_CARD_MARGIN_TOP * scale }}>
        <DetailPlaceCard
          imageUrl={business.image}
          title={business.title}
          address={business.location}
          hours={MOCK_HOURS}
          liked={isPlaceLiked}
          onLikeClick={handlePlaceLikeToggle}
        />
      </div>
    </ResponsivePageShell>
  );
}

/**
 * 라우트 파라미터만 바뀌면 리액트 라우터가 컴포넌트를 언마운트하지 않으므로,
 * key 로 강제 리마운트해 좋아요/토스트 상태가 이전 업체에 남지 않게 한다.
 */
function LocalBusinessDetailPage() {
  const { id } = useParams<{ id?: string }>();

  return <LocalBusinessDetailContent key={id ?? 'default'} businessId={id} />;
}

export default LocalBusinessDetailPage;
