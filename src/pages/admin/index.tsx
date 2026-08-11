import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '../../apis/common';
import {
  ConfirmDialog,
  ContentCard,
  ContentCardSkeleton,
  EditableContentCard,
  FloatingActionButton,
  SearchTriggerButton,
  SectionHeader,
} from '../../components/common';
import { useToast } from '../../components/toast';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useContentDelete } from '../../hooks/useContentDelete';
import { useContentPublish } from '../../hooks/useContentPublish';
import { useCultureContentBanners } from '../../hooks/useCultureContentBanners';
import { useEditFestival } from '../../hooks/useEditFestival';
import { useCultureContents } from '../../hooks/useCultureContents';
import { useRecentCultureContents } from '../../hooks/useRecentCultureContents';
import { useSyncTourContents } from '../../hooks/useTourContentSync';
import { useAdminEventRegistrationStore } from '../../store/adminEventRegistration.store';
import { toContentTagIds } from '../../utils/contentTags';
import { buildFestivalDetailPath } from '../../utils/routes';

import { FeaturedFestivalBanner } from '../festival/components';
import useFestivalPreviews from '../festival/hooks/useFestivalPreviews';
import type { FeaturedFestival } from '../festival/types';
import ContentPublishModal from './components/ContentPublishModal';

const ONGOING_PREVIEW_COUNT = 2;
const BANNER_ITEM_COUNT = 5;
const BANNER_ROTATE_INTERVAL_MS = 2000;
const RETRY_PADDING_X = 16;
const RETRY_PADDING_Y = 8;
const RETRY_TEXT_SIZE = 14;
const ERROR_MARGIN_TOP = 16;
const ERROR_TEXT_SIZE = 13;

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 21;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 17;
const SEARCH_MARGIN_TOP = 12;
const BANNER_MARGIN_TOP = 12;
const SECTION_MARGIN_TOP = 32;
const LIST_MARGIN_TOP = 12;
const LIST_GAP = 16;
const PENDING_CONTENT_PREVIEW_COUNT = 20;
const SYNC_BUTTON_HEIGHT = 44;
const SYNC_BUTTON_TEXT_SIZE = 14;
const SYNC_BUTTON_RADIUS = 12;

function AdminPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { showToast } = useToast();
  const { featuredFestival } = useFestivalPreviews();
  const recentFestivals = useRecentCultureContents().slice(0, 2);
  const { data: cultureContentBanners } = useCultureContentBanners();
  const {
    data: ongoingContentsData,
    isPending: isOngoingContentsPending,
    isError: isOngoingContentsError,
    refetch: refetchOngoingContents,
  } = useCultureContents({
    statuses: ['ONGOING'],
    sort: 'RECOMMEND',
    size: ONGOING_PREVIEW_COUNT,
  });
  const { data: pendingContentsData } = useCultureContents({
    publicationStatus: 'PENDING',
    size: PENDING_CONTENT_PREVIEW_COUNT,
  });
  const pendingContents = pendingContentsData?.pages[0]?.items ?? [];
  const syncTourContentsMutation = useSyncTourContents();
  const { requestPublish, modalProps: publishModalProps } = useContentPublish();
  const resetRegistration = useAdminEventRegistrationStore(
    (state) => state.reset
  );
  const { editFestival } = useEditFestival();
  const { requestDelete, dialogProps: deleteDialogProps } = useContentDelete();
  const ongoingFestivals = ongoingContentsData?.pages[0]?.items ?? [];

  // 여기도 홈(festival/index.tsx)과 동일하게 상위 5개를 2초마다 자동
  // 전환한다. 배너 전용 API가 지금은 5개만 내려주지만, 다른 배너들처럼
  // 여기서도 명시적으로 잘라서 앞으로 응답 개수가 늘어나도 5개로 고정한다.
  const bannerFestivals: FeaturedFestival[] = (cultureContentBanners ?? [])
    .slice(0, BANNER_ITEM_COUNT)
    .map((banner) => ({
      id: banner.contentId,
      image: banner.thumbnailImage,
      title: banner.title,
      description: banner.description,
      period: `${banner.startDate} ~ ${banner.endDate}`,
    }));
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    if (bannerFestivals.length <= 1) return;

    const timer = setInterval(() => {
      setBannerIndex(
        (previousIndex) => (previousIndex + 1) % bannerFestivals.length
      );
    }, BANNER_ROTATE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [bannerFestivals.length]);

  const activeBanner = bannerFestivals[bannerIndex % bannerFestivals.length];
  const displayedBanner = activeBanner ?? featuredFestival;

  const goToFestivalSearch = () => {
    navigate('/course-region-search?from=festival');
  };

  const goToOngoingFestivals = () => {
    navigate('/admin/festivals/ongoing');
  };

  const goToRecentFestivals = () => {
    navigate('/admin/festivals/recent');
  };

  const handleStartRegistration = () => {
    resetRegistration();
    navigate('/admin/event-registration/place-selection');
  };

  const handleSync = async () => {
    try {
      const result = await syncTourContentsMutation.mutateAsync();
      showToast(
        `관광공사 콘텐츠 동기화 완료 — 수신 ${result.receivedCount}건, 신규 ${result.createdCount}건, 갱신 ${result.updatedCount}건, 실패 ${result.skippedCount}건`
      );
    } catch (error) {
      showToast(
        getApiErrorMessage(error, '관광공사 콘텐츠 동기화에 실패했어요.')
      );
    }
  };

  return (
    <>
      <section
        className="mx-auto flex min-h-screen w-full flex-col"
        style={{
          paddingLeft: PAGE_PADDING_X * scale,
          paddingRight: PAGE_PADDING_X * scale,
          paddingTop: PAGE_PADDING_TOP * scale,
          paddingBottom: PAGE_PADDING_BOTTOM * scale,
        }}
      >
        <div>
          <h1
            className="font-semibold text-black"
            style={{
              fontSize: TITLE_SIZE * scale,
              lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
            }}
          >
            어디로 떠나볼까요?
          </h1>
          <p
            className="text-gray-5 font-normal"
            style={{
              marginTop: DESCRIPTION_MARGIN_TOP * scale,
              fontSize: DESCRIPTION_SIZE * scale,
              lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
            }}
          >
            다양한 지역의 행사를 만나보세요
          </p>
        </div>

        <div style={{ marginTop: SEARCH_MARGIN_TOP * scale }}>
          <SearchTriggerButton
            label="행사명 또는 지역명 검색 화면으로 이동"
            placeholder="행사명 또는 지역명을 검색해 주세요"
            onClick={goToFestivalSearch}
          />
        </div>

        <div style={{ marginTop: BANNER_MARGIN_TOP * scale }}>
          <FeaturedFestivalBanner
            festival={displayedBanner}
            onClick={() =>
              activeBanner
                ? navigate(buildFestivalDetailPath(activeBanner.id))
                : goToFestivalSearch()
            }
          />
        </div>

        <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
          <SectionHeader
            title="진행 중인 행사"
            actionText="전체 보기"
            onActionClick={goToOngoingFestivals}
          />

          <div
            className="grid grid-cols-2"
            style={{
              marginTop: LIST_MARGIN_TOP * scale,
              gap: LIST_GAP * scale,
            }}
          >
            {isOngoingContentsPending ? (
              <>
                <ContentCardSkeleton />
                <ContentCardSkeleton />
              </>
            ) : (
              ongoingFestivals.map((festival) => (
                <EditableContentCard
                  key={festival.contentId}
                  image={festival.thumbnailImageUrl}
                  title={festival.title}
                  firstInfo={`${festival.startDate} ~ ${festival.endDate}`}
                  secondInfo={festival.regionName}
                  tags={toContentTagIds(festival.hashtags)}
                  className="w-full"
                  onClick={() =>
                    navigate(buildFestivalDetailPath(festival.contentId))
                  }
                  onEdit={() => void editFestival(festival.contentId)}
                  onDelete={() => requestDelete(festival.contentId)}
                />
              ))
            )}
          </div>

          {!isOngoingContentsPending && isOngoingContentsError ? (
            <div
              className="flex flex-col items-center"
              style={{
                marginTop: ERROR_MARGIN_TOP * scale,
                gap: ERROR_MARGIN_TOP * scale,
              }}
            >
              <p
                className="text-main-5 text-center font-medium"
                style={{ fontSize: ERROR_TEXT_SIZE * scale }}
              >
                행사 목록을 불러오지 못했어요.
              </p>
              <button
                type="button"
                onClick={() => void refetchOngoingContents()}
                className="rounded-full border border-[#e4e4e4] font-medium text-[#505050]"
                style={{
                  paddingLeft: RETRY_PADDING_X * scale,
                  paddingRight: RETRY_PADDING_X * scale,
                  paddingTop: RETRY_PADDING_Y * scale,
                  paddingBottom: RETRY_PADDING_Y * scale,
                  fontSize: RETRY_TEXT_SIZE * scale,
                }}
              >
                다시 시도
              </button>
            </div>
          ) : null}
        </section>

        {recentFestivals.length > 0 ? (
          <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
            <SectionHeader
              title="최근 본 행사"
              actionText="전체 보기"
              onActionClick={goToRecentFestivals}
            />

            <div
              className="grid grid-cols-2"
              style={{
                marginTop: LIST_MARGIN_TOP * scale,
                gap: LIST_GAP * scale,
              }}
            >
              {recentFestivals.map((festival) => (
                <EditableContentCard
                  key={festival.contentId}
                  image={festival.thumbnailImageUrl}
                  title={festival.title}
                  firstInfo={`${festival.startDate} ~ ${festival.endDate}`}
                  secondInfo={festival.regionName}
                  tags={toContentTagIds(festival.hashtags)}
                  className="w-full"
                  onClick={() =>
                    navigate(buildFestivalDetailPath(festival.contentId))
                  }
                  onEdit={() => void editFestival(festival.contentId)}
                  onDelete={() => requestDelete(festival.contentId)}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
          <SectionHeader title="관광공사 콘텐츠 동기화" />
          <button
            type="button"
            onClick={() => void handleSync()}
            disabled={syncTourContentsMutation.isPending}
            className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 w-full font-semibold"
            style={{
              marginTop: LIST_MARGIN_TOP * scale,
              height: SYNC_BUTTON_HEIGHT * scale,
              fontSize: SYNC_BUTTON_TEXT_SIZE * scale,
              borderRadius: SYNC_BUTTON_RADIUS * scale,
            }}
          >
            {syncTourContentsMutation.isPending
              ? '동기화 중...'
              : '지금 동기화'}
          </button>
        </section>

        {pendingContents.length > 0 ? (
          <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
            <SectionHeader
              title={`검토 대기 콘텐츠 (${pendingContents.length})`}
            />

            <div
              className="grid grid-cols-2"
              style={{
                marginTop: LIST_MARGIN_TOP * scale,
                gap: LIST_GAP * scale,
              }}
            >
              {pendingContents.map((content) => (
                <ContentCard
                  key={content.contentId}
                  image={content.thumbnailImageUrl}
                  title={content.title}
                  firstInfo={`${content.startDate} ~ ${content.endDate}`}
                  secondInfo={content.regionName}
                  tags={toContentTagIds(content.hashtags)}
                  className="w-full"
                  onClick={() => requestPublish(content.contentId)}
                />
              ))}
            </div>
          </section>
        ) : null}

        <FloatingActionButton
          ariaLabel="여기도 추천 행사 등록"
          onClick={handleStartRegistration}
        />
      </section>
      <ConfirmDialog
        {...deleteDialogProps}
        title="행사를 삭제할까요?"
        description="삭제한 행사는 되돌릴 수 없어요."
      />
      <ContentPublishModal
        key={publishModalProps.contentId}
        {...publishModalProps}
      />
    </>
  );
}

export default AdminPage;
