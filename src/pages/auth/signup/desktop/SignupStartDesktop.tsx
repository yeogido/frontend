import { useState } from 'react';
import { Link } from 'react-router-dom';

import { KakaoIcon, NaverIcon } from '../../../../components/auth';
import AuthDesktopLayout from '../../../../components/auth/desktop/AuthDesktopLayout';
import { AUTH_TITLE_CLASS } from '../../../../components/auth/desktop/authDesktopStyles';
import { useKakaoLogin } from '../../../../hooks/useKakaoLogin';
import { useNaverLogin } from '../../../../hooks/useNaverLogin';

const KAKAO_START_ERROR_MESSAGE =
  '카카오로 시작하지 못했습니다. 다시 시도해 주세요.';
const NAVER_START_ERROR_MESSAGE =
  '네이버로 시작하지 못했습니다. 다시 시도해 주세요.';

// Figma 1440 데스크톱 시안(5663:1019) 기준 리터럴 px.
const BUTTON_CLASS =
  'flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[12px] px-[10px] py-[16px] text-[18px] font-semibold disabled:cursor-not-allowed disabled:opacity-60';

interface SignupStartDesktopProps {
  readonly onEmailStart: () => void;
}

/** 회원가입 방법 선택 — 카카오, 네이버, 이메일. */
function SignupStartDesktop({ onEmailStart }: SignupStartDesktopProps) {
  const [submitError, setSubmitError] = useState('');
  const { loginWithKakao, isLoading: isKakaoLoading } = useKakaoLogin();
  const { loginWithNaver, isLoading: isNaverLoading } = useNaverLogin();
  // 한 SDK가 로딩되는 동안 다른 소셜 버튼을 눌러 authorize()가 동시에
  // 두 번 시작되지 않도록, 두 버튼을 하나의 로딩 상태로 함께 잠근다.
  const isSocialLoginLoading = isKakaoLoading || isNaverLoading;

  // 로그인 화면의 소셜 버튼과 같은 authorize() 호출이다. 콜백
  // (/auth/kakao|naver/callback)이 isNewUser로 신규/기존 회원을 가른다.
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
    <AuthDesktopLayout>
      <div className="flex flex-col gap-[60px]">
        <div className="flex flex-col items-center gap-[12px] text-center">
          <h1 className={`${AUTH_TITLE_CLASS} leading-[1.2]`}>
            여기도에 오신 것을
            <br />
            환영해요!
          </h1>
          <p className="text-gray-5 text-[16px]">
            나만의 로컬 여행을 지금 시작해 보세요
          </p>
        </div>

        <div className="flex flex-col gap-[48px]">
          <div className="flex flex-col gap-[16px]">
            <button
              type="button"
              onClick={() => void handleKakaoStart()}
              disabled={isSocialLoginLoading}
              className={`${BUTTON_CLASS} bg-[#FEE500] text-[#1c1c1c]`}
            >
              <KakaoIcon width={20} height={20} aria-hidden="true" />
              카카오로 시작하기
            </button>

            <button
              type="button"
              onClick={() => void handleNaverStart()}
              disabled={isSocialLoginLoading}
              className={`${BUTTON_CLASS} bg-[#03C75A] text-white`}
            >
              <NaverIcon width={16} height={16} aria-hidden="true" />
              네이버로 시작하기
            </button>

            <button
              type="button"
              onClick={onEmailStart}
              disabled={isSocialLoginLoading}
              className={`${BUTTON_CLASS} border-gray-2 border bg-white text-[#1c1c1c]`}
            >
              이메일로 시작하기
            </button>

            {submitError ? (
              <p
                role="alert"
                className="text-main-5 text-center text-[12px] font-medium"
              >
                {submitError}
              </p>
            ) : null}
          </div>

          <p className="text-gray-4 flex flex-col items-center gap-[4px] text-[12px]">
            이미 계정이 있으신가요?
            <Link to="/login" className="text-gray-5 underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </AuthDesktopLayout>
  );
}

export default SignupStartDesktop;
