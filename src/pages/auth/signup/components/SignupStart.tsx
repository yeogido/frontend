import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { BackButton, KakaoIcon, NaverIcon } from '../../../../components/auth';

import logo from '../../../../assets/icons/logo.svg';
import yeogido from '../../../../assets/icons/yeogido.svg';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useKakaoLogin } from '../../../../hooks/useKakaoLogin';
import { useNaverLogin } from '../../../../hooks/useNaverLogin';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 56;
const PAGE_PADDING_BOTTOM = 40;

const LOGO_MARGIN_TOP = 0;

const LOGO_SIZE = 92;
const YEOGIDO_WIDTH = 91;
const YEOGIDO_HEIGHT = 49;

const LOGO_GAP = 12;

const TITLE_MARGIN_TOP = 32;
const DESCRIPTION_MARGIN_TOP = 12;

const TITLE_WIDTH = 237;
const DESCRIPTION_WIDTH = 271;

const TITLE_FONT_SIZE = 32;
const DESCRIPTION_FONT_SIZE = 18;

const BUTTON_SECTION_MARGIN_TOP = 80;
const BUTTON_HEIGHT = 53;
const BUTTON_GAP = 16;

const LOGIN_SECTION_MARGIN_TOP = 48;
const LOGIN_LINK_MARGIN_TOP = 4;

const KAKAO_ICON_SIZE = 18;
const NAVER_ICON_SIZE = 16;
const BUTTON_ICON_GAP = 10;

const ERROR_MESSAGE_MARGIN_TOP = 12;

const KAKAO_START_ERROR_MESSAGE =
  '카카오로 시작하지 못했습니다. 다시 시도해 주세요.';
const NAVER_START_ERROR_MESSAGE =
  '네이버로 시작하지 못했습니다. 다시 시도해 주세요.';

interface SignupStartProps {
  onEmailStart: () => void;
}

function SignupStart({ onEmailStart }: SignupStartProps) {
  const navigate = useNavigate();
  const scale = useGlobalScale();

  const s = (value: number) => value * scale;

  const [submitError, setSubmitError] = useState('');
  const { loginWithKakao, isLoading: isKakaoLoading } = useKakaoLogin();
  const { loginWithNaver, isLoading: isNaverLoading } = useNaverLogin();
  // 한 SDK가 로딩되는 동안 다른 소셜 버튼을 눌러 authorize()가 동시에
  // 두 번 시작되지 않도록, 두 버튼을 하나의 로딩 상태로 함께 잠근다.
  const isSocialLoginLoading = isKakaoLoading || isNaverLoading;

  // 로그인 화면의 아이콘 버튼과 동일한 authorize() 호출을 그대로 쓴다.
  // 콜백(/auth/kakao|naver/callback)은 어느 화면에서 시작했는지와
  // 무관하게 백엔드 응답의 isNewUser로만 신규/기존 회원을 분기하므로,
  // 회원가입 화면 전용 로직이 따로 필요 없다.
  const handleKakaoStart = async () => {
    setSubmitError('');

    try {
      await loginWithKakao();
    } catch (error) {
      console.error('[카카오로 시작하기 실패]', error);
      setSubmitError(KAKAO_START_ERROR_MESSAGE);
    }
  };

  const handleNaverStart = async () => {
    setSubmitError('');

    try {
      await loginWithNaver();
    } catch (error) {
      console.error('[네이버로 시작하기 실패]', error);
      setSubmitError(NAVER_START_ERROR_MESSAGE);
    }
  };

  return (
    <div className="min-h-dvh w-full bg-background">
      <section
        className="mx-auto flex min-h-dvh w-full max-w-[500px] flex-col"
        style={{
          paddingTop: s(PAGE_PADDING_TOP),
          paddingBottom: s(PAGE_PADDING_BOTTOM),
          paddingLeft: s(PAGE_PADDING_X),
          paddingRight: s(PAGE_PADDING_X),
        }}
      >
        <BackButton onClick={() => navigate(-1)} />

        <div
          className="flex flex-col items-center"
          style={{
            marginTop: s(LOGO_MARGIN_TOP),
          }}
        >
          <img
            src={logo}
            alt=""
            aria-hidden="true"
            style={{
              width: s(LOGO_SIZE),
              height: s(LOGO_SIZE),
            }}
          />

          <img
            src={yeogido}
            alt="여기도"
            style={{
              width: s(YEOGIDO_WIDTH),
              height: s(YEOGIDO_HEIGHT),
              marginTop: s(LOGO_GAP),
            }}
          />

          <h1
            className="text-center font-semibold text-[#1C1C1C]"
            style={{
              width: s(TITLE_WIDTH),
              marginTop: s(TITLE_MARGIN_TOP),
              fontSize: s(TITLE_FONT_SIZE),
              lineHeight: `${s(TITLE_FONT_SIZE)}px`,
            }}
          >
            여기도에 오신 것을
            <br />
            환영해요!
          </h1>

          <p
            className="text-center font-medium text-[#1C1C1C]"
            style={{
              width: s(DESCRIPTION_WIDTH),
              marginTop: s(DESCRIPTION_MARGIN_TOP),
              fontSize: s(DESCRIPTION_FONT_SIZE),
              lineHeight: `${s(DESCRIPTION_FONT_SIZE)}px`,
            }}
          >
            나만의 로컬 여행을 지금 시작해 보세요
          </p>
        </div>

        <div
          style={{
            marginTop: s(BUTTON_SECTION_MARGIN_TOP),
          }}
        >
          <div
            className="flex flex-col"
            style={{
              gap: s(BUTTON_GAP),
            }}
          >
            <button
              type="button"
              onClick={handleKakaoStart}
              disabled={isSocialLoginLoading}
              className="flex items-center justify-center rounded-xl bg-[#FEE500] font-bold text-black disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                height: s(BUTTON_HEIGHT),
                fontSize: s(16),
              }}
            >
              <div
                className="flex items-center"
                style={{
                  gap: s(BUTTON_ICON_GAP),
                }}
              >
                <KakaoIcon
                  width={s(KAKAO_ICON_SIZE)}
                  height={s(KAKAO_ICON_SIZE)}
                  aria-hidden="true"
                />

                <span>카카오로 시작하기</span>
              </div>
            </button>
            <button
              type="button"
              onClick={handleNaverStart}
              disabled={isSocialLoginLoading}
              className="flex items-center justify-center rounded-xl bg-[#03C75A] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                height: s(BUTTON_HEIGHT),
                fontSize: s(16),
              }}
            >
              <div
                className="flex items-center"
                style={{
                  gap: s(BUTTON_ICON_GAP),
                }}
              >
                <NaverIcon
                  width={s(NAVER_ICON_SIZE)}
                  height={s(NAVER_ICON_SIZE)}
                  aria-hidden="true"
                />

                <span>네이버로 시작하기</span>
              </div>
            </button>

            <button
              type="button"
              onClick={onEmailStart}
              className="rounded-xl border border-gray-2 bg-white font-bold text-black"
              style={{
                height: s(BUTTON_HEIGHT),
                fontSize: s(16),
              }}
            >
              이메일로 시작하기
            </button>

            {submitError && (
              <p
                role="alert"
                className="text-center font-medium text-main-5"
                style={{
                  marginTop: s(ERROR_MESSAGE_MARGIN_TOP),
                  fontSize: s(12),
                  lineHeight: `${s(12)}px`,
                }}
              >
                {submitError}
              </p>
            )}
          </div>

          <div
            className="text-center"
            style={{
              marginTop: s(LOGIN_SECTION_MARGIN_TOP),
            }}
          >
            <p
              className="font-medium text-gray-3"
              style={{
                fontSize: s(12),
                lineHeight: `${s(12)}px`,
              }}
            >
              이미 계정이 있으신가요?
            </p>

            <Link
              to="/login"
              className="inline-block font-bold text-gray-5 underline underline-offset-2"
              style={{
                marginTop: s(LOGIN_LINK_MARGIN_TOP),
                fontSize: s(12),
                lineHeight: `${s(12)}px`,
              }}
            >
              로그인
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SignupStart;