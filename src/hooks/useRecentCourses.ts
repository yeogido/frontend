import { useEffect, useState } from 'react';

import {
  RECENT_COURSES_UPDATED_EVENT,
  getStoredRecentCourses,
} from '../utils/recentCourses';
import { useAuthStore } from '../store/auth.store';

export function useRecentCourses() {
  const authGeneration = useAuthStore((state) => state.authGeneration);
  const [recentCourses, setRecentCourses] = useState(getStoredRecentCourses);
  const [storedAuthGeneration, setStoredAuthGeneration] =
    useState(authGeneration);

  if (storedAuthGeneration !== authGeneration) {
    setStoredAuthGeneration(authGeneration);
    setRecentCourses(getStoredRecentCourses());
  }

  useEffect(() => {
    const handleUpdate = () => setRecentCourses(getStoredRecentCourses());

    window.addEventListener(RECENT_COURSES_UPDATED_EVENT, handleUpdate);

    return () =>
      window.removeEventListener(RECENT_COURSES_UPDATED_EVENT, handleUpdate);
  }, []);

  return recentCourses;
}
