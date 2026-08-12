import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createBusinessPromotion } from '../../apis/business-promotions.api';
import { getApiErrorMessage } from '../../apis/common';
import { useToast } from '../../components/toast';
import type { BusinessInfoResponse } from '../../types/business.type';
import type { BusinessPromotionCreateRequest } from '../../types/businessPromotion.type';
import { buildLocalBusinessDetailPath } from '../../utils/routes';

import { PlaceSelectionScreen } from './place-selection/components';
import { PromotionInfoScreen } from './promotion-info/components';
import type {
  PromotionInfoFormValues,
  PromotionInfoResult,
} from './promotion-info/schema';
import { PhotoTagSelectionScreen } from './photo-tag-selection/components';
import type {
  PhotoTagSelectionPhoto,
  PhotoTagSelectionResult,
  PromotionCategoryLabel,
  TagId,
} from './photo-tag-selection/types';

type Step = 'place' | 'info' | 'photo-tag';

const REGISTER_SUCCESS_MESSAGE = '홍보 게시물을 등록했어요.';
const REGISTER_ERROR_MESSAGE = '홍보 게시물 등록에 실패했어요. 다시 시도해 주세요.';

function BusinessPromotionRegistrationPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>('place');

  // 1단계: 선택한 사업장.
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

  // 뒤로가기로 이 화면들을 오갈 때는 photos를 그대로 들고 있어야 하니(위
  // state가 그 역할), blob URL은 여기서 매번 정리하면 안 된다. 이 플로우
  // 자체를 완전히 벗어날 때(등록 성공 이동, 첫 단계에서 뒤로가기 등으로
  // 이 오케스트레이터가 언마운트될 때) 딱 한 번만 남은 걸 전부 해제한다.
  const photosRef = useRef(photos);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

  const handlePlaceNext = () => {
    if (!selectedBusiness) return;
    setStep('info');
  };

  const handleInfoNext = (values: PromotionInfoResult) => {
    setPromotionInfo(values);
    setStep('photo-tag');
  };

  // 1단계 API(createBusinessPromotion)는 여기서 처음이자 마지막으로 호출한다.
  // 실패해도 던지지 않고 토스트로만 알린다 — 그대로 던지면 PhotoTagSelectionScreen
  // 자신의 try/catch가 잡아서 "사진/키워드 등록에 실패했어요"라는, 실제 원인과
  // 다를 수 있는 문구를 보여주게 된다.
  const handlePhotoTagNext = async (photoTag: PhotoTagSelectionResult) => {
    if (!selectedBusiness || !promotionInfo) return;

    const payload: BusinessPromotionCreateRequest = {
      businessInfoId: selectedBusiness.businessInfoId,
      shortDescription: promotionInfo.shortDescription,
      ownerComment: promotionInfo.ownerComment,
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

  if (step === 'place') {
    return (
      <PlaceSelectionScreen
        selectedBusiness={selectedBusiness}
        onSelectedBusinessChange={setSelectedBusiness}
        onNext={handlePlaceNext}
        onBack={() => navigate(-1)}
      />
    );
  }

  if (step === 'info') {
    // selectedBusiness는 'place' 단계를 거쳐야만 'info'로 넘어오므로 항상 있다.
    if (!selectedBusiness) {
      setStep('place');
      return null;
    }

    return (
      <PromotionInfoScreen
        business={selectedBusiness}
        defaultValues={promotionInfoDraft}
        onValuesChange={setPromotionInfoDraft}
        onNext={handleInfoNext}
        onBack={() => setStep('place')}
      />
    );
  }

  return (
    <PhotoTagSelectionScreen
      photos={photos}
      onPhotosChange={setPhotos}
      selectedTagIds={selectedTagIds}
      onSelectedTagIdsChange={setSelectedTagIds}
      category={category}
      onCategoryChange={setCategory}
      onNext={handlePhotoTagNext}
      onBack={() => setStep('info')}
    />
  );
}

export default BusinessPromotionRegistrationPage;
