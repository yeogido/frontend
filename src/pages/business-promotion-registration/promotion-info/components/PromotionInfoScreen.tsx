import { ResponsivePageShell } from '../../../../components/layout/ResponsivePageShell';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import type { BusinessInfoResponse } from '../../../../types/business.type';

import type { PromotionInfoFormValues, PromotionInfoResult } from '../schema';
import BackButton from './BackButton';
import PromotionInfoForm from './PromotionInfoForm';

// Figma 390 디자인 기준 리터럴 px.
// 2단계에서는 폼(PromotionInfoForm)만 만들고 제목·선택한 사업장 카드는
// "3단계에서 조립" 하기로 미뤄뒀다 — 여기가 그 조립 지점이다.
const PAGE_PADDING_TOP = 48;
const PAGE_PADDING_BOTTOM = 32;
const TITLE_SIZE = 30;
const DESCRIPTION_MARGIN_TOP = 12;
const DESCRIPTION_SIZE = 14;
const PLACE_CARD_MARGIN_TOP = 24;
const PLACE_CARD_PADDING = 12;
const PLACE_CARD_RADIUS = 12;
const PLACE_CARD_GAP = 12;
const PLACE_IMAGE_SIZE = 56;
const PLACE_TITLE_SIZE = 15;
const PLACE_ADDRESS_MARGIN_TOP = 4;
const PLACE_ADDRESS_SIZE = 13;

interface PromotionInfoScreenProps {
  business: BusinessInfoResponse;
  defaultValues?: Partial<PromotionInfoFormValues>;
  onValuesChange?: (values: PromotionInfoFormValues) => void;
  onNext: (values: PromotionInfoResult) => void | Promise<void>;
  onBack: () => void;
}

function PromotionInfoScreen({
  business,
  defaultValues,
  onValuesChange,
  onNext,
  onBack,
}: PromotionInfoScreenProps) {
  const scale = useGlobalScale();

  return (
    <ResponsivePageShell
      mode="standalone"
      topPadding={PAGE_PADDING_TOP}
      bottomPadding={PAGE_PADDING_BOTTOM}
      className="bg-white"
    >
      <BackButton onClick={onBack} />

      <h1
        className="leading-[1.28] font-bold tracking-[-0.02em] text-black"
        style={{ fontSize: TITLE_SIZE * scale }}
      >
        홍보글 정보를
        <br />
        입력해주세요
      </h1>
      <p
        className="text-gray-5"
        style={{
          marginTop: DESCRIPTION_MARGIN_TOP * scale,
          fontSize: DESCRIPTION_SIZE * scale,
        }}
      >
        사업장의 기본 정보를 입력해주세요
      </p>

      {/* Place_List_Card 자리 — BusinessInfoResponse엔 이미지가 없어(3단계에서도
          같은 이유로 marker 아이콘 카드로 대체) 여기는 빈 회색 박스로 대신한다. */}
      <div
        className="bg-background flex items-center"
        style={{
          marginTop: PLACE_CARD_MARGIN_TOP * scale,
          padding: PLACE_CARD_PADDING * scale,
          borderRadius: PLACE_CARD_RADIUS * scale,
          gap: PLACE_CARD_GAP * scale,
        }}
      >
        <div
          className="bg-gray-2 shrink-0"
          style={{
            width: PLACE_IMAGE_SIZE * scale,
            height: PLACE_IMAGE_SIZE * scale,
            borderRadius: PLACE_CARD_RADIUS * scale,
          }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p
            className="truncate font-semibold text-black"
            style={{ fontSize: PLACE_TITLE_SIZE * scale }}
          >
            {business.businessName}
          </p>
          <p
            className="text-gray-5 truncate"
            style={{
              marginTop: PLACE_ADDRESS_MARGIN_TOP * scale,
              fontSize: PLACE_ADDRESS_SIZE * scale,
            }}
          >
            {business.businessAddress}
          </p>
        </div>
      </div>

      <PromotionInfoForm
        onNext={onNext}
        defaultValues={defaultValues}
        onValuesChange={onValuesChange}
      />
    </ResponsivePageShell>
  );
}

export default PromotionInfoScreen;
