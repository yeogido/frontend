import { useState } from 'react';

import { getStoredRecentCourses } from '../utils/recentCourses';

export function useRecentCourses() {
  const [recentCourses] = useState(getStoredRecentCourses);

  return recentCourses;
}
