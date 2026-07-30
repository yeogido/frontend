import { useState } from 'react';

import { getStoredRecentCultureContents } from '../utils/recentCultureContents';

export function useRecentCultureContents() {
  const [recentCultureContents] = useState(getStoredRecentCultureContents);

  return recentCultureContents;
}
