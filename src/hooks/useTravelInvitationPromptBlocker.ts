import { useSyncExternalStore } from 'react';

function getSnapshot() {
  if (document.visibilityState !== 'visible') return true;
  const focused = document.activeElement;
  if (focused?.matches('input, textarea, select, [contenteditable="true"]'))
    return true;
  return [
    ...document.querySelectorAll<HTMLElement>(
      '[role="dialog"], [aria-modal="true"], dialog[open]'
    ),
  ].some(
    (element) =>
      !element.hasAttribute('data-automatic-travel-invitation') &&
      element.getAttribute('aria-hidden') !== 'true' &&
      element.getClientRects().length > 0
  );
}

function subscribe(notify: () => void) {
  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(notify);
  };
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['role', 'aria-modal', 'aria-hidden', 'open', 'hidden'],
  });
  document.addEventListener('visibilitychange', schedule);
  document.addEventListener('focusin', schedule);
  document.addEventListener('focusout', schedule);
  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    document.removeEventListener('visibilitychange', schedule);
    document.removeEventListener('focusin', schedule);
    document.removeEventListener('focusout', schedule);
  };
}

/** Suspend automatic prompts while another interaction owns the screen. */
export function useTravelInvitationPromptBlocker() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
