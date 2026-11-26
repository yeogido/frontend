import { useSyncExternalStore } from 'react';

const dialogSelector = '[role="dialog"], [aria-modal="true"], dialog[open]';

function containsDialog(node: Node) {
  return (
    node instanceof Element &&
    (node.matches(dialogSelector) ||
      node.querySelector(dialogSelector) !== null)
  );
}

function affectsDialogs(records: MutationRecord[]) {
  return records.some((record) => {
    if (record.type === 'attributes') {
      return (
        containsDialog(record.target) ||
        (record.attributeName === 'role' && record.oldValue === 'dialog') ||
        (record.attributeName === 'aria-modal' && record.oldValue === 'true') ||
        (record.attributeName === 'open' &&
          record.target instanceof HTMLDialogElement &&
          record.oldValue !== null)
      );
    }
    return [...record.addedNodes, ...record.removedNodes].some(containsDialog);
  });
}

function getSnapshot() {
  if (document.visibilityState !== 'visible') return true;
  const focused = document.activeElement;
  if (focused?.matches('input, textarea, select, [contenteditable="true"]'))
    return true;
  return [...document.querySelectorAll<HTMLElement>(dialogSelector)].some(
    (element) =>
      !element.hasAttribute('data-automatic-travel-invitation') &&
      element.getAttribute('aria-hidden') !== 'true' &&
      element.getClientRects().length > 0
  );
}

function subscribe(notify: () => void) {
  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      notify();
    });
  };
  const observer = new MutationObserver((records) => {
    if (affectsDialogs(records)) schedule();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
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
