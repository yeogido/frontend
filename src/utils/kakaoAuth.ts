const KAKAO_AUTH_SCRIPT_ID = 'kakao-auth-sdk';
const KAKAO_SDK_VERSION = '2.7.2';
let sdkPromise: Promise<void> | null = null;

export function loadKakaoAuthSdk(appKey: string): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(
      new Error('브라우저에서만 카카오 로그인을 불러올 수 있습니다.')
    );
  }

  if (window.Kakao?.isInitialized()) {
    return Promise.resolve();
  }

  if (!appKey.trim()) {
    return Promise.reject(new Error('카카오 JS 키가 설정되지 않았습니다.'));
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    // 실패한 스크립트 태그를 문서에 남겨두면, 이미 load/error 이벤트가
    // 끝난 태그라 다음 시도에서 재사용해도 이벤트가 다시 발생하지 않아
    // Promise가 영원히 대기하게 된다. 다음 시도가 새 <script>를 새로
    // 만들 수 있도록 실패 시 태그 자체를 제거한다.
    const resetFailedScript = () => {
      sdkPromise = null;

      document.getElementById(KAKAO_AUTH_SCRIPT_ID)?.remove();
    };

    const initialize = () => {
      if (!window.Kakao) {
        resetFailedScript();
        reject(new Error('카카오 SDK를 초기화하지 못했습니다.'));
        return;
      }

      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(appKey);
      }

      resolve();
    };

    const handleError = () => {
      resetFailedScript();
      reject(new Error('카카오 SDK를 불러오지 못했습니다.'));
    };

    const existingScript = document.getElementById(
      KAKAO_AUTH_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.Kakao) {
        initialize();
        return;
      }

      existingScript.addEventListener('load', initialize, { once: true });
      existingScript.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = KAKAO_AUTH_SCRIPT_ID;
    script.async = true;
    script.src = `https://t1.kakaocdn.net/kakao_js_sdk/${KAKAO_SDK_VERSION}/kakao.min.js`;
    script.addEventListener('load', initialize, { once: true });
    script.addEventListener('error', handleError, { once: true });
    document.head.appendChild(script);
  });

  return sdkPromise;
}
