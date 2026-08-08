import { useEffect, useState } from 'react';

import type { Neighborhood } from './types';

const STORAGE_KEY = 'local-recommendation-recent-regions';
const MAX_RECENT = 5;

function readStoredRecentRegions(): Neighborhood[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useRecentRegions() {
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

  const removeRecentRegion = (regionId: number) => {
    setRecentRegions((current) =>
      current.filter((region) => region.id !== regionId),
    );
  };

  const clearRecentRegions = () => setRecentRegions([]);

  return {
    recentRegions,
    addRecentRegion,
    removeRecentRegion,
    clearRecentRegions,
  };
}

