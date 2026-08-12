const ONBOARDING_DISMISSED_KEY = 'onboarding-dismissed';

// 시크릿 모드의 스토리지 제한 등으로 localStorage 접근 자체가 막혀 있을 수
// 있다 — 그런 경우에도 온보딩을 매번 다시 보여주기만 할 뿐, 홈 화면 렌더링
// 자체가 죽으면 안 되므로 실패를 조용히 흡수한다.
export function hasSeenOnboarding(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function dismissOnboardingPermanently(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
  } catch {
    // 저장에 실패해도 "닫기" 동작 자체는 계속돼야 하므로 무시한다.
  }
}
