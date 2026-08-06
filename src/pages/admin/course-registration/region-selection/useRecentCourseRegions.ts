import { useEffect, useState } from 'react';

import type { Neighborhood } from '../../../local-recommendation/region-selection/types';

const STORAGE_KEY = 'admin-course-registration-recent-regions';
const MAX_RECENT = 5;

function isNeighborhood(value: unknown): value is Neighborhood {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.parentName === 'string'
  );
}

function readStoredRecentRegions(): Neighborhood[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed.filter(isNeighborhood) : [];
  } catch {
    return [];
  }
}

export function useRecentCourseRegions() {
  const [recentRegions, setRecentRegions] = useState<Neighborhood[]>(
    readStoredRecentRegions
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentRegions));
    } catch {
      // localStorage unavailable (private mode, quota) — recency just
      // won't persist across reloads, not worth surfacing an error for.
    }
  }, [recentRegions]);

  const addRecentRegion = (neighborhood: Neighborhood) => {
    setRecentRegions((current) =>
      [
        neighborhood,
        ...current.filter((item) => item.id !== neighborhood.id),
      ].slice(0, MAX_RECENT)
    );
  };

  return { recentRegions, addRecentRegion };
}
