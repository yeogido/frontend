const ONBOARDING_DISMISSED_KEY = 'onboarding-dismissed';

export function hasSeenOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true';
}

export function dismissOnboardingPermanently(): void {
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
}
