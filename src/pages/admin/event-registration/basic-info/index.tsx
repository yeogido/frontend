import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../../../components/layout/ResponsivePageShell';
import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useAdminEventRegistrationStore } from '../../../../store/adminEventRegistration.store';

import BackButton from '../../../local-recommendation/components/BackButton';
import FormField from '../../../local-recommendation/course-basic-info/components/FormField';
import EventDateGroup from './components/EventDateGroup';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_TOP = 48;
const TITLE_FONT_SIZE = 32;
const SUBTITLE_MARGIN_TOP = 12;
const SUBTITLE_FONT_SIZE = 14;
const FORM_MARGIN_TOP = 32;
const FIELD_GAP = 32;
const INPUT_HEIGHT = 48;
const INPUT_PADDING_X = 16;
const INPUT_FONT_SIZE = 14;
const BORDER_RADIUS = 12;
const DATE_GROUP_GAP = 16;
const DATE_ERROR_MARGIN_TOP = 8;
const DATE_ERROR_FONT_SIZE = 12;
const SUBMIT_MARGIN_TOP = 40;
const SUBMIT_HEIGHT = 53;
const SUBMIT_FONT_SIZE = 16;

const PHONE_PATTERN = /^0\d{1,2}-\d{3,4}-\d{4}$/;

function AdminEventBasicInfoPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const place = useAdminEventRegistrationStore((state) => state.place);
  const basicInfo = useAdminEventRegistrationStore((state) => state.basicInfo);
  const setBasicInfo = useAdminEventRegistrationStore(
    (state) => state.setBasicInfo
  );
  const [form, setForm] = useState(() => ({
    ...basicInfo,
    placeName: basicInfo.placeName || place?.title || '',
  }));

  const inputHeight = Math.max(44, INPUT_HEIGHT * scale);
  const inputStyle = {
    height: inputHeight,
    paddingLeft: INPUT_PADDING_X * scale,
    paddingRight: INPUT_PADDING_X * scale,
    fontSize: INPUT_FONT_SIZE * scale,
    borderRadius: BORDER_RADIUS * scale,
  };

  const isEndDateBeforeStart = Boolean(
    form.startDate && form.endDate && form.endDate < form.startDate
  );
  const isPhoneValid =
    form.phone.trim() === '' || PHONE_PATTERN.test(form.phone.trim());
  const isReady = Boolean(
    form.placeName &&
      form.startDate &&
      form.endDate &&
      !isEndDateBeforeStart &&
      isPhoneValid
  );

  const handleSubmit = () => {
    if (!isReady) return;
    setBasicInfo(form);
    navigate('/admin/event-registration/photo-tag');
  };

  return (
    <ResponsivePageShell
      mode="standalone"
      topPadding={PAGE_PADDING_TOP}
      bottomPadding={32}
      className="bg-white"
    >
      <BackButton
        onClick={() => navigate('/admin/event-registration/place-selection')}
      />
      <header>
        <h1
          className="leading-[1.15] font-bold"
          style={{ fontSize: TITLE_FONT_SIZE * scale }}
        >
          어떤
          <br />
          행사인가요?
        </h1>
        <p
          className="text-gray-4"
          style={{
            marginTop: SUBTITLE_MARGIN_TOP * scale,
            fontSize: SUBTITLE_FONT_SIZE * scale,
          }}
        >
          행사의 기본 정보를 입력해주세요
        </p>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
        style={{ marginTop: FORM_MARGIN_TOP * scale }}
      >
        <div className="flex flex-col" style={{ gap: FIELD_GAP * scale }}>
          <FormField id="event-place-name" label="장소의 이름을 알려주세요">
            <input
              id="event-place-name"
              type="text"
              value={form.placeName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, placeName: event.target.value }))
              }
              placeholder="예) 부산 오션뷰 카페"
              className="border-gray-2 placeholder:text-gray-4 focus:border-main-5 w-full border bg-white outline-none"
              style={inputStyle}
            />
          </FormField>

          <FormField id="event-place-intro" label="장소를 짧게 소개해주세요">
            <input
              id="event-place-intro"
              type="text"
              value={form.placeIntro}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, placeIntro: event.target.value }))
              }
              placeholder="여행자들에게 전하고 싶은 한마디를 적어보세요"
              className="border-gray-2 placeholder:text-gray-4 focus:border-main-5 w-full border bg-white outline-none"
              style={inputStyle}
            />
          </FormField>

          <div>
            <p
              className="mb-3 font-semibold"
              style={{ fontSize: 16 * scale }}
            >
              행사 기간을 입력해 주세요
            </p>
            <div
              className="flex flex-col"
              style={{ gap: DATE_GROUP_GAP * scale }}
            >
              <EventDateGroup
                id="event-start-date"
                legend="시작 날짜"
                value={form.startDate}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, startDate: value }))
                }
              />
              <EventDateGroup
                id="event-end-date"
                legend="종료 날짜"
                value={form.endDate}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, endDate: value }))
                }
              />
            </div>
            {isEndDateBeforeStart ? (
              <p
                className="text-main-5"
                style={{
                  marginTop: DATE_ERROR_MARGIN_TOP * scale,
                  fontSize: DATE_ERROR_FONT_SIZE * scale,
                }}
                role="alert"
              >
                종료 날짜는 시작 날짜보다 빠를 수 없어요.
              </p>
            ) : null}
          </div>

          <FormField id="event-phone" label="연락 가능한 전화번호를 입력해 주세요">
            <input
              id="event-phone"
              type="tel"
              value={form.phone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phone: event.target.value }))
              }
              placeholder="예) 000-0000-0000"
              className={`placeholder:text-gray-4 w-full border bg-white outline-none ${
                isPhoneValid
                  ? 'border-gray-2 focus:border-main-5'
                  : 'border-main-5'
              }`}
              style={inputStyle}
            />
            {!isPhoneValid ? (
              <p
                className="text-main-5"
                style={{
                  marginTop: DATE_ERROR_MARGIN_TOP * scale,
                  fontSize: DATE_ERROR_FONT_SIZE * scale,
                }}
                role="alert"
              >
                전화번호 형식이 올바르지 않아요. (예: 000-0000-0000)
              </p>
            ) : null}
          </FormField>

          <FormField id="event-homepage" label="공식 홈페이지를 입력해 주세요">
            <input
              id="event-homepage"
              type="text"
              value={form.homepage}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, homepage: event.target.value }))
              }
              placeholder="예) http://yeogido.kr"
              className="border-gray-2 placeholder:text-gray-4 focus:border-main-5 w-full border bg-white outline-none"
              style={inputStyle}
            />
          </FormField>
        </div>

        <button
          type="submit"
          disabled={!isReady}
          className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 w-full font-semibold disabled:cursor-not-allowed"
          style={{
            marginTop: SUBMIT_MARGIN_TOP * scale,
            height: Math.max(MIN_TOUCH_TARGET, SUBMIT_HEIGHT * scale),
            fontSize: SUBMIT_FONT_SIZE * scale,
            borderRadius: BORDER_RADIUS * scale,
          }}
        >
          사진 추가하기
        </button>
      </form>
    </ResponsivePageShell>
  );
}

export default AdminEventBasicInfoPage;
