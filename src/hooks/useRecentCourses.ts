import { useEffect, useState } from 'react';

import {
  RECENT_COURSES_UPDATED_EVENT,
  getStoredRecentCourses,
} from '../utils/recentCourses';

export function useRecentCourses() {
  const [recentCourses, setRecentCourses] = useState(getStoredRecentCourses);

  useEffect(() => {
    const handleUpdate = () => setRecentCourses(getStoredRecentCourses());

    window.addEventListener(RECENT_COURSES_UPDATED_EVENT, handleUpdate);

    return () =>
      window.removeEventListener(RECENT_COURSES_UPDATED_EVENT, handleUpdate);
  }, []);

  return recentCourses;
}
