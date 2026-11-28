import { useGlobalScale } from '../../../../hooks/useGlobalScale';

import {
  usePromotionInfoForm,
  type UsePromotionInfoFormParams,
} from '../usePromotionInfoForm';
import BusinessHoursField from './BusinessHoursField';
import FormField from './FormField';

// Figma 390 디자인 기준 리터럴 px
const FORM_MARGIN_TOP = 32;
const FIELD_GAP = 32;
const HOURS_FIELD_GAP = 16;
const INPUT_HEIGHT = 48;
const INPUT_PADDING_X = 16;
const INPUT_FONT_SIZE = 14;
const LARGE_BORDER_RADIUS = 12;
const SUBMIT_MARGIN_TOP = 40;
const SUBMIT_HEIGHT = 52;
const SUBMIT_FONT_SIZE = 16;
// 서버도 255자로 검증한다. 카운터는 입력창 아래 오른쪽(시안 606:3159).
const DESCRIPTION_MAX_LENGTH = 255;
const COUNTER_MARGIN_TOP = 4;
const COUNTER_FONT_SIZE = 12;

function PromotionInfoForm(props: UsePromotionInfoFormParams) {
  const scale = useGlobalScale();

  const {
    register,
    control,
    submitForm,
    shortDescription,
    dayTimeErrorMessageByDay,
    snsAccountErrorMessage,
    isReady,
    isSubmitting,
  } = usePromotionInfoForm(props);

  const inputHeight = Math.max(44, INPUT_HEIGHT * scale);
  const submitHeight = Math.max(44, SUBMIT_HEIGHT * scale);

  const inputStyle = {
    height: inputHeight,
    paddingLeft: INPUT_PADDING_X * scale,
    paddingRight: INPUT_PADDING_X * scale,
    fontSize: INPUT_FONT_SIZE * scale,
    borderRadius: LARGE_BORDER_RADIUS * scale,
  };

  return (
    <form onSubmit={submitForm} style={{ marginTop: FORM_MARGIN_TOP * scale }}>
      <div className="flex flex-col" style={{ gap: FIELD_GAP * scale }}>
        <FormField
          id="promotion-short-description"
          label="사업장을 소개해주세요"
        >
          <input
            {...register('shortDescription')}
            id="promotion-short-description"
            type="text"
            maxLength={DESCRIPTION_MAX_LENGTH}
            placeholder="여행자들에게 전하고 싶은 한마디를 적어보세요"
            className="border-gray-2 placeholder:text-gray-4 focus:border-main-5 w-full border bg-white outline-none"
            style={inputStyle}
          />
          <p
            className="text-gray-4 text-right"
            style={{
              marginTop: COUNTER_MARGIN_TOP * scale,
              fontSize: COUNTER_FONT_SIZE * scale,
            }}
          >
            ({shortDescription.length}/{DESCRIPTION_MAX_LENGTH})
          </p>
        </FormField>

        <FormField id="promotion-business-hours" label="영업 시간을 알려주세요">
          <div
            className="flex flex-col"
            style={{ gap: HOURS_FIELD_GAP * scale }}
          >
            <BusinessHoursField
              control={control}
              errorMessageByDay={dayTimeErrorMessageByDay}
            />
          </div>
        </FormField>

        <FormField
          id="promotion-phone-number"
          label="연락 가능한 전화번호를 입력해 주세요"
        >
          <input
            {...register('phoneNumber')}
            id="promotion-phone-number"
            type="tel"
            placeholder="010-0000-0000"
            className="border-gray-2 placeholder:text-gray-4 focus:border-main-5 w-full border bg-white outline-none"
            style={inputStyle}
          />
        </FormField>

        <FormField
          id="promotion-sns-account"
          label="SNS 계정이 있다면 알려주세요(선택)"
        >
          <input
            {...register('snsAccount')}
            id="promotion-sns-account"
            type="text"
            placeholder="instagram.com/아이디"
            className="border-gray-2 placeholder:text-gray-4 focus:border-main-5 w-full border bg-white outline-none"
            style={inputStyle}
          />
          {snsAccountErrorMessage ? (
            <p
              className="text-main-5"
              style={{ marginTop: 6 * scale, fontSize: 12 * scale }}
              role="alert"
            >
              {snsAccountErrorMessage}
            </p>
          ) : null}
        </FormField>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isReady}
        className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 w-full font-semibold disabled:cursor-not-allowed"
        style={{
          marginTop: SUBMIT_MARGIN_TOP * scale,
          height: submitHeight,
          fontSize: SUBMIT_FONT_SIZE * scale,
          borderRadius: LARGE_BORDER_RADIUS * scale,
        }}
      >
        사진 추가하기
      </button>
    </form>
  );
}

export default PromotionInfoForm;
