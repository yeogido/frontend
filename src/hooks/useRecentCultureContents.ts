import { useEffect, useState } from 'react';

import {
  RECENT_CULTURE_CONTENTS_UPDATED_EVENT,
  getStoredRecentCultureContents,
} from '../utils/recentCultureContents';

export function useRecentCultureContents() {
  const [recentCultureContents, setRecentCultureContents] = useState(
    getStoredRecentCultureContents
  );

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
