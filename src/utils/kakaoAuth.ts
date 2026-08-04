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
    const initialize = () => {
      if (!window.Kakao) {
        sdkPromise = null;
        reject(new Error('카카오 SDK를 초기화하지 못했습니다.'));
        return;
      }

      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(appKey);
      }

      resolve();
    };

    const handleError = () => {
      sdkPromise = null;
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
