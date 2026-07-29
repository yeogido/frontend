import { useEffect, useRef, useState } from 'react';

const TOAST_VISIBLE_DURATION = 1600;
const COPIED_RESET_DURATION = 2000;

export function useShareToast() {
  const [copied, setCopied] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setIsToastVisible(true);
      fadeTimerRef.current = setTimeout(
        () => setIsToastVisible(false),
        TOAST_VISIBLE_DURATION
      );
      copiedTimerRef.current = setTimeout(
        () => setCopied(false),
        COPIED_RESET_DURATION
      );
    } catch {
      setCopied(false);
    }
  };

  return { copied, isToastVisible, handleShare };
}

export default useShareToast;
