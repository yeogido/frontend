import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// pages/profile/hooks/useUnsavedChangesGuard.ts를 그대로 복사했다(이 기능
// 전체가 따르는 "공용 훅은 복사해서 분리" 원칙 — 프로필 쪽이 나중에
// 바뀌어도 이 플로우엔 영향이 없어야 한다). 로직 자체는 순수하게
// isDirty만 받아 동작해서 profile 도메인에 대한 의존이 전혀 없다.
const UNSAVED_CHANGES_HISTORY_KEY = '__yeogidoUnsavedChangesGuard';

export function createUnsavedChangesHistoryState(state: unknown) {
  const previousState =
    state && typeof state === 'object'
      ? (state as Record<string, unknown>)
      : {};

  return {
    ...previousState,
    [UNSAVED_CHANGES_HISTORY_KEY]: true,
  };
}

export function isUnsavedChangesHistoryState(state: unknown) {
  return (
    Boolean(state) &&
    typeof state === 'object' &&
    (state as Record<string, unknown>)[UNSAVED_CHANGES_HISTORY_KEY] === true
  );
}

export function getUnsavedChangesHistoryOffset(
  action: 'restore' | 'leave'
) {
  return action === 'restore' ? 1 : -2;
}

export function getInternalNavigationPath(href: string, origin: string) {
  const url = new URL(href, origin);

  return url.origin === origin
    ? `${url.pathname}${url.search}${url.hash}`
    : null;
}

export function useUnsavedChangesGuard(isDirty: boolean) {
  const navigate = useNavigate();
  const pendingNavigationRef = useRef<(() => void) | null>(null);
  const isRestoringSafetyEntryRef = useRef(false);
  const shouldAllowNextPopRef = useRef(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const requestNavigation = useCallback(
    (navigation: () => void) => {
      if (!isDirty) {
        navigation();
        return;
      }

      pendingNavigationRef.current = navigation;
      setIsDialogOpen(true);
    },
    [isDirty]
  );

  const handleConfirm = useCallback(() => {
    const navigation = pendingNavigationRef.current;

    pendingNavigationRef.current = null;
    setIsDialogOpen(false);
    navigation?.();
  }, []);

  const handleCancel = useCallback(() => {
    pendingNavigationRef.current = null;
    setIsDialogOpen(false);
  }, []);

  useEffect(() => {
    if (!isDirty) return;

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      const anchor =
        target instanceof Element
          ? target.closest<HTMLAnchorElement>('a[href]')
          : null;

      if (
        !anchor ||
        anchor.target ||
        anchor.hasAttribute('download') ||
        anchor.getAttribute('rel') === 'external'
      ) {
        return;
      }

      const path = getInternalNavigationPath(anchor.href, window.location.origin);
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (!path || path === currentPath) return;

      event.preventDefault();
      requestNavigation(() => navigate(path));
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, [isDirty, navigate, requestNavigation]);

  useEffect(() => {
    if (!isDirty) return;

    if (!isUnsavedChangesHistoryState(window.history.state)) {
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      window.history.pushState(
        createUnsavedChangesHistoryState(window.history.state),
        '',
        currentPath
      );
    }

    return undefined;
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;

    const handlePopState = () => {
      if (isRestoringSafetyEntryRef.current) {
        isRestoringSafetyEntryRef.current = false;
        return;
      }

      if (shouldAllowNextPopRef.current) {
        shouldAllowNextPopRef.current = false;
        return;
      }

      isRestoringSafetyEntryRef.current = true;
      window.history.go(getUnsavedChangesHistoryOffset('restore'));
      requestNavigation(() => {
        shouldAllowNextPopRef.current = true;
        window.history.go(getUnsavedChangesHistoryOffset('leave'));
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDirty, requestNavigation]);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return {
    isDialogOpen,
    requestNavigation,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };
}
