import { useEffect, useState } from 'react';

import {
  RECENT_CULTURE_CONTENTS_UPDATED_EVENT,
  getStoredRecentCultureContents,
} from '../utils/recentCultureContents';
import { useAuthStore } from '../store/auth.store';

export function useRecentCultureContents() {
  const authGeneration = useAuthStore((state) => state.authGeneration);
  const [recentCultureContents, setRecentCultureContents] = useState(
    getStoredRecentCultureContents
  );
  const [storedAuthGeneration, setStoredAuthGeneration] =
    useState(authGeneration);

  if (storedAuthGeneration !== authGeneration) {
    setStoredAuthGeneration(authGeneration);
    setRecentCultureContents(getStoredRecentCultureContents());
  }

  useEffect(() => {
    const handleUpdate = () =>
      setRecentCultureContents(getStoredRecentCultureContents());

    window.addEventListener(RECENT_CULTURE_CONTENTS_UPDATED_EVENT, handleUpdate);

    return () =>
      window.removeEventListener(
        RECENT_CULTURE_CONTENTS_UPDATED_EVENT,
        handleUpdate
      );
  }, []);

  return recentCultureContents;
}
