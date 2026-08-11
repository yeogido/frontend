import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import {
  createBusinessPromotion,
  updateBusinessPromotion,
} from '../../apis/business-promotions.api';
import { getApiErrorMessage, normalizeApiError } from '../../apis/common';
import { LoadingSpinner } from '../../components/common';
import { useToast } from '../../components/toast';
import { useBusinessPromotionDetail } from '../../hooks/useBusinessPromotionDetail';
import type { BusinessInfoResponse } from '../../types/business.type';
import type {
  BusinessPromotionCreateRequest,
  BusinessPromotionUpdateRequest,
} from '../../types/businessPromotion.type';
import { toContentTagIds } from '../../utils/contentTags';
import { buildLocalBusinessDetailPath } from '../../utils/routes';

import { UnsavedChangesDialog } from './components/UnsavedChangesDialog';
import { useUnsavedChangesGuard } from './hooks/useUnsavedChangesGuard';
import {
  mapApiCategoryToLabel,
  mapBusinessCategoryToApiParam,
} from '../local-business/mappers/businessPromotionMapper';
import { PlaceSelectionScreen } from './place-selection/components';
import { PromotionInfoScreen } from './promotion-info/components';
import type {
  DayOfWeek,
  PromotionInfoBusinessHour,
  PromotionInfoFormValues,
  PromotionInfoResult,
} from './promotion-info/schema';
import { PhotoTagSelectionScreen } from './photo-tag-selection/components';
import type {
  PhotoTagSelectionImage,
  PhotoTagSelectionPhoto,
  PhotoTagSelectionResult,
  PromotionCategoryLabel,
  TagId,
} from './photo-tag-selection/types';

type Step = 'place' | 'info' | 'photo-tag';

const REGISTER_SUCCESS_MESSAGE = '홍보 게시물을 등록했어요.';
const REGISTER_ERROR_MESSAGE = '홍보 게시물 등록에 실패했어요. 다시 시도해 주세요.';
const UPDATE_SUCCESS_MESSAGE = '홍보 게시물을 수정했어요.';
const UPDATE_ERROR_MESSAGE = '홍보 게시물 수정에 실패했어요. 다시 시도해 주세요.';
const NO_CHANGES_MESSAGE = '변경된 내용이 없어요.';
const PROMOTION_NOT_FOUND_MESSAGE = '이미 삭제되었거나 존재하지 않는 게시물이에요.';
const DETAIL_LOAD_ERROR_MESSAGE = '홍보 게시물 정보를 불러오지 못했어요.';

const PROMOTION_NOT_FOUND_CODE = 'BUSINESS_PROMOTION4041';

// businessHours는 순서와 무관하게 요일별로만 비교한다(요일 선택 UI가
// 배열 순서를 보장하지 않는다).
function areBusinessHoursEqual(
  a: readonly PromotionInfoBusinessHour[],
  b: readonly PromotionInfoBusinessHour[]
): boolean {
  if (a.length !== b.length) return false;

  const byDay = new Map(b.map((hour) => [hour.dayOfWeek, hour]));

  return a.every((hour) => {
    const other = byDay.get(hour.dayOfWeek);
    return (
      other !== undefined &&
      other.openTime === hour.openTime &&
      other.closeTime === hour.closeTime
    );
  });
}

// images는 sortOrder(=대표 사진 순서)가 의미를 가지므로 순서까지 비교한다.
function areImagesEqual(
  a: readonly PhotoTagSelectionImage[],
  b: readonly PhotoTagSelectionImage[]
): boolean {
  return (
    a.length === b.length &&
    a.every(
      (image, index) =>
        image.imageKey === b[index].imageKey &&
        image.sortOrder === b[index].sortOrder
    )
  );
}

function areTagIdSetsEqual(a: Set<TagId>, b: Set<TagId>): boolean {
  return a.size === b.size && Array.from(a).every((tagId) => b.has(tagId));
}

interface EditSnapshot {
  shortDescription: string;
  phoneNumber: string;
  snsAccount: string;
  businessHours: PromotionInfoBusinessHour[];
  images: PhotoTagSelectionImage[];
  selectedTagIds: Set<TagId>;
  category: PromotionCategoryLabel;
}

function BusinessPromotionRegistrationPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { promotionId: promotionIdParam } = useParams<{
    promotionId: string;
  }>();

  // businessInfoId(장소)와 ownerComment는 PATCH 스펙에 아예 없어(스웨거
  // 확인 완료) 수정 화면에는 장소 선택 단계가 없다 — 곧장 정보 입력부터
  // 시작해 등록 플로우의 나머지 두 단계만 재사용한다.
  const isEditMode = promotionIdParam !== undefined;
  const promotionId = isEditMode ? Number(promotionIdParam) : undefined;

  const detailQuery = useBusinessPromotionDetail(promotionId ?? 0);

  const [step, setStep] = useState<Step>(isEditMode ? 'info' : 'place');

  // 1단계: 선택한 사업장. 수정 모드에선 쓰지 않는다.
  const [selectedBusiness, setSelectedBusiness] =
    useState<BusinessInfoResponse | null>(null);

  // 2단계: 아직 제출 전인 입력값(뒤로가기 시 복원용)과, 제출을 마친 결과
  // (최종 등록 payload용) — 폼이 매 입력마다 넘겨주는 raw 값과, 제출 시점에
  // 검증까지 끝난 businessHours 배열은 모양이 달라 따로 둔다.
  const [promotionInfoDraft, setPromotionInfoDraft] =
    useState<Partial<PromotionInfoFormValues>>();
  const [promotionInfo, setPromotionInfo] =
    useState<PromotionInfoResult | null>(null);

  // 3단계: 사진/키워드/카테고리 진행 중 값.
  const [photos, setPhotos] = useState<PhotoTagSelectionPhoto[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<TagId>>(
    () => new Set()
  );
  const [category, setCategory] = useState<PromotionCategoryLabel | null>(
    null
  );

  // 수정 모드: 기존 값을 한 번만 채워 넣고(그 이후엔 사용자 입력이
  // 우선한다), 제출 시 무엇이 바뀌었는지 비교할 원본 스냅샷도 함께 둔다.
  // isEditDirty/handlePhotoTagNext가 렌더 중에 이 값을 읽으므로 ref가
  // 아니라 state로 둔다.
  const [hasSeeded, setHasSeeded] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState<EditSnapshot | null>(null);

  useEffect(() => {
    if (!isEditMode || hasSeeded || !detailQuery.data) return;

    const detail = detailQuery.data;

    const openDays = detail.businessHours.map(
      (hour) => hour.dayOfWeek as DayOfWeek
    );
    const dayTimes: Partial<Record<DayOfWeek, { openTime: string; closeTime: string }>> =
      {};
    detail.businessHours.forEach((hour) => {
      dayTimes[hour.dayOfWeek as DayOfWeek] = {
        openTime: hour.openTime,
        closeTime: hour.closeTime,
      };
    });
    const snsAccount = detail.snsAccount ?? '';
    const initialCategory = mapApiCategoryToLabel(detail.promotionCategory);
    const initialSelectedTagIds = new Set(toContentTagIds(detail.hashtags));
    const initialImages: PhotoTagSelectionImage[] = [...detail.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image, index) => ({
        imageKey: image.imageKey,
        sortOrder: index + 1,
      }));

    // 상세 조회가 끝난 뒤 프리필값을 딱 한 번 채워 넣는다(hasSeeded 가드로
    // 재실행을 막는다) — 렌더 중 계산으로 옮길 수 없는, 외부(서버) 데이터를
    // 동기화하는 경우라 여기서 직접 setState한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPromotionInfoDraft({
      shortDescription: detail.shortDescription,
      openDays,
      dayTimes,
      phoneNumber: detail.phoneNumber,
      snsAccount,
    });
    setPhotos(
      initialImages.map((image) => ({
        id: `existing-${image.imageKey}`,
        kind: 'existing',
        imageKey: image.imageKey,
        previewUrl:
          detail.images.find((original) => original.imageKey === image.imageKey)
            ?.imageUrl ?? '',
      }))
    );
    setSelectedTagIds(initialSelectedTagIds);
    setCategory(initialCategory);

    setEditSnapshot({
      shortDescription: detail.shortDescription,
      phoneNumber: detail.phoneNumber,
      snsAccount,
      businessHours: detail.businessHours.map((hour) => ({
        dayOfWeek: hour.dayOfWeek as DayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
      })),
      images: initialImages,
      selectedTagIds: initialSelectedTagIds,
      category: initialCategory,
    });
    setHasSeeded(true);
  }, [isEditMode, hasSeeded, detailQuery.data]);

  // 뒤로가기로 이 화면들을 오갈 때는 photos를 그대로 들고 있어야 하니(위
  // state가 그 역할), blob URL은 여기서 매번 정리하면 안 된다. 이 플로우
  // 자체를 완전히 벗어날 때(등록 성공 이동, 첫 단계에서 뒤로가기 등으로
  // 이 오케스트레이터가 언마운트될 때) 딱 한 번만 남은 걸 전부 해제한다.
  // 수정 모드에서 프리필된 사진(kind: 'existing')은 blob URL이 아니라
  // 서버 URL이라 해제할 필요가 없다 — new 사진만 골라 해제한다.
  const photosRef = useRef(photos);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => {
        if (photo.kind === 'new') URL.revokeObjectURL(photo.previewUrl);
      });
    };
  }, []);

  // 화면 내 "<" 버튼 뒤로가기는 setStep으로만 처리해서 브라우저 히스토리를
  // 건드리지 않는다 — 그래서 이 가드는 실제로 navigate(-1)할 때만 걸면
  // 되고(등록 모드는 place 단계, 수정 모드는 info 단계가 그 지점), 브라우저
  // 자체 뒤로가기·스와이프 제스처는 이 컴포넌트가 어느 단계를 보여주고
  // 있든 상관없이 popstate로 잡힌다.
  const isPromotionInfoDirty = Boolean(
    promotionInfoDraft?.shortDescription ||
      promotionInfoDraft?.phoneNumber ||
      promotionInfoDraft?.snsAccount ||
      (promotionInfoDraft?.openDays?.length ?? 0) > 0
  );

  const snapshot = editSnapshot;
  // 수정 모드는 전부 프리필된 상태로 시작하므로 "값이 있으면 dirty"가 아니라
  // "원본과 달라졌으면 dirty"로 판단해야 한다.
  const isEditDirty = Boolean(
    isEditMode &&
      snapshot &&
      (promotionInfoDraft?.shortDescription !== snapshot.shortDescription ||
        promotionInfoDraft?.phoneNumber !== snapshot.phoneNumber ||
        (promotionInfoDraft?.snsAccount ?? '') !== snapshot.snsAccount ||
        !areBusinessHoursEqual(
          (promotionInfoDraft?.openDays ?? []).map((day) => ({
            dayOfWeek: day,
            openTime: promotionInfoDraft?.dayTimes?.[day]?.openTime ?? '',
            closeTime: promotionInfoDraft?.dayTimes?.[day]?.closeTime ?? '',
          })),
          snapshot.businessHours
        ) ||
        photos.length !== snapshot.images.length ||
        photos.some(
          (photo, index) =>
            photo.kind !== 'existing' ||
            photo.imageKey !== snapshot.images[index]?.imageKey
        ) ||
        !areTagIdSetsEqual(selectedTagIds, snapshot.selectedTagIds) ||
        category !== snapshot.category)
  );

  const isDirty = isEditMode
    ? isEditDirty
    : selectedBusiness !== null ||
      isPromotionInfoDirty ||
      photos.length > 0 ||
      selectedTagIds.size > 0 ||
      category !== null;
  const unsavedChangesGuard = useUnsavedChangesGuard(isDirty);

  const handlePlaceNext = () => {
    if (!selectedBusiness) return;
    setStep('info');
  };

  const handleInfoNext = (values: PromotionInfoResult) => {
    setPromotionInfo(values);
    setStep('photo-tag');
  };

  // 등록(POST)/수정(PATCH) API는 여기서 처음이자 마지막으로 호출한다.
  // 실패해도 던지지 않고 토스트로만 알린다 — 그대로 던지면 PhotoTagSelectionScreen
  // 자신의 try/catch가 잡아서 "사진/키워드 등록에 실패했어요"라는, 실제 원인과
  // 다를 수 있는 문구를 보여주게 된다.
  const handlePhotoTagNext = async (photoTag: PhotoTagSelectionResult) => {
    if (isEditMode) {
      if (promotionId === undefined || !promotionInfo || !snapshot) return;

      const payload: BusinessPromotionUpdateRequest = {};

      if (promotionInfo.shortDescription !== snapshot.shortDescription) {
        payload.shortDescription = promotionInfo.shortDescription;
      }
      if (promotionInfo.phoneNumber !== snapshot.phoneNumber) {
        payload.phoneNumber = promotionInfo.phoneNumber;
      }
      if (
        !areBusinessHoursEqual(promotionInfo.businessHours, snapshot.businessHours)
      ) {
        payload.businessHours = promotionInfo.businessHours;
      }

      const nextSnsAccount = promotionInfo.snsAccount ?? '';
      if (nextSnsAccount !== snapshot.snsAccount) {
        if (nextSnsAccount === '') {
          payload.clearSnsAccount = true;
        } else {
          payload.snsAccount = nextSnsAccount;
        }
      }

      if (!areImagesEqual(photoTag.images, snapshot.images)) {
        payload.images = photoTag.images;
      }
      if (!areTagIdSetsEqual(selectedTagIds, snapshot.selectedTagIds)) {
        payload.hashtagIds = photoTag.hashtagIds;
      }
      if (
        photoTag.promotionCategory !==
        mapBusinessCategoryToApiParam(snapshot.category)
      ) {
        payload.promotionCategory = photoTag.promotionCategory;
      }

      // 전달한 필드만 부분 수정되는 API라, 바뀐 게 하나도 없으면 빈 객체를
      // 보내게 되어 COMMON4001로 거부된다 — 여기서 먼저 막는다.
      if (Object.keys(payload).length === 0) {
        showToast(NO_CHANGES_MESSAGE);
        return;
      }

      try {
        await updateBusinessPromotion(promotionId, payload);
        void queryClient.invalidateQueries({
          queryKey: ['businessPromotion', promotionId],
        });
        void queryClient.invalidateQueries({ queryKey: ['businessPromotions'] });
        void queryClient.invalidateQueries({ queryKey: ['myPosts'] });
        showToast(UPDATE_SUCCESS_MESSAGE);
        navigate(buildLocalBusinessDetailPath(promotionId));
      } catch (error) {
        if (normalizeApiError(error).code === PROMOTION_NOT_FOUND_CODE) {
          showToast(PROMOTION_NOT_FOUND_MESSAGE);
          navigate('/local-business');
          return;
        }

        showToast(getApiErrorMessage(error, UPDATE_ERROR_MESSAGE));
      }
      return;
    }

    if (!selectedBusiness || !promotionInfo) return;

    const payload: BusinessPromotionCreateRequest = {
      businessInfoId: selectedBusiness.businessInfoId,
      shortDescription: promotionInfo.shortDescription,
      businessHours: promotionInfo.businessHours,
      phoneNumber: promotionInfo.phoneNumber,
      snsAccount: promotionInfo.snsAccount,
      hashtagIds: photoTag.hashtagIds,
      promotionCategory: photoTag.promotionCategory,
      images: photoTag.images,
    };

    try {
      const result = await createBusinessPromotion(payload);
      showToast(REGISTER_SUCCESS_MESSAGE);
      navigate(buildLocalBusinessDetailPath(result.promotionId));
    } catch (error) {
      showToast(getApiErrorMessage(error, REGISTER_ERROR_MESSAGE));
    }
  };

  // 실제로 플로우를 벗어나는 navigate 호출은 여기 하나뿐이라(info/photo-tag의
  // onBack은 setStep일 뿐 라우팅이 아니다), requestNavigation으로 감싸는
  // 지점도 여기 하나면 된다.
  const handleLeaveFlow = () => {
    unsavedChangesGuard.requestNavigation(() => navigate(-1));
  };

  if (isEditMode && !hasSeeded) {
    if (detailQuery.isError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-gray-5 text-sm">{DETAIL_LOAD_ERROR_MESSAGE}</p>
          <button
            type="button"
            onClick={() =>
              navigate(
                promotionId !== undefined
                  ? buildLocalBusinessDetailPath(promotionId)
                  : '/my-posts'
              )
            }
            className="border-gray-2 text-gray-5 rounded-full border px-4 py-2 text-sm font-medium"
          >
            돌아가기
          </button>
        </div>
      );
    }

    return <LoadingSpinner className="min-h-screen" label="홍보글 정보를 불러오는 중" />;
  }

  let content: ReactNode;

  if (step === 'place') {
    content = (
      <PlaceSelectionScreen
        selectedBusiness={selectedBusiness}
        onSelectedBusinessChange={setSelectedBusiness}
        onNext={handlePlaceNext}
        onBack={handleLeaveFlow}
      />
    );
  } else if (step === 'info') {
    if (!isEditMode && !selectedBusiness) {
      // selectedBusiness는 'place' 단계를 거쳐야만 'info'로 넘어오므로
      // 항상 있다 — 없다면 비정상 진입이니 첫 단계로 되돌린다. 수정
      // 모드는 애초에 place 단계가 없으니 이 되돌림 대상이 아니다.
      setStep('place');
      content = null;
    } else {
      content = (
        <PromotionInfoScreen
          business={
            isEditMode && detailQuery.data
              ? {
                  businessName: detailQuery.data.place.name,
                  businessAddress: detailQuery.data.place.roadAddress,
                }
              : (selectedBusiness as BusinessInfoResponse)
          }
          defaultValues={promotionInfoDraft}
          onValuesChange={setPromotionInfoDraft}
          onNext={handleInfoNext}
          onBack={isEditMode ? handleLeaveFlow : () => setStep('place')}
        />
      );
    }
  } else {
    content = (
      <PhotoTagSelectionScreen
        photos={photos}
        onPhotosChange={setPhotos}
        selectedTagIds={selectedTagIds}
        onSelectedTagIdsChange={setSelectedTagIds}
        category={category}
        onCategoryChange={setCategory}
        onNext={handlePhotoTagNext}
        onBack={() => setStep('info')}
        mode={isEditMode ? 'edit' : 'create'}
      />
    );
  }

  return (
    <>
      {content}
      <UnsavedChangesDialog
        isOpen={unsavedChangesGuard.isDialogOpen}
        onConfirm={unsavedChangesGuard.onConfirm}
        onCancel={unsavedChangesGuard.onCancel}
      />
    </>
  );
}

export default BusinessPromotionRegistrationPage;
