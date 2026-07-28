import { Link } from 'react-router-dom';

import { KakaoIcon, NaverIcon } from '../../../../components/auth';

import logo from '../../../../assets/icons/logo.svg';
import yeogido from '../../../../assets/icons/yeogido.svg';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 56;

const LOGO_MARGIN_TOP = 95;

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

interface SignupStartProps {
  onEmailStart: () => void;
}

function SignupStart({ onEmailStart }: SignupStartProps) {
  const scale = useGlobalScale();

  const s = (value: number) => value * scale;

  return (
    <div className="min-h-dvh w-full bg-background">
      <section
        className="mx-auto flex min-h-dvh w-full max-w-[500px] flex-col"
        style={{
          paddingTop: s(PAGE_PADDING_TOP),
          paddingLeft: s(PAGE_PADDING_X),
          paddingRight: s(PAGE_PADDING_X),
        }}
      >
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
            <Link
              to="/signup/kakao"
              className="flex items-center justify-center rounded-xl bg-[#FEE500] font-bold text-black"
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
            </Link>
            <Link
              to="/signup/naver"
              className="flex items-center justify-center rounded-xl bg-[#03C75A] font-bold text-white"
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
            </Link>

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