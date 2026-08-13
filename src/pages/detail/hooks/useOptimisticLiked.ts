import { useState } from 'react';

type LikeRequest = (nextLiked: boolean) => Promise<void>;

export function useOptimisticLiked(
  initialLiked: boolean,
  request: LikeRequest,
) {
  const [liked, setLiked] = useState(initialLiked);
  const [isPending, setIsPending] = useState(false);

  const toggle = async () => {
    if (isPending) return;

    const previousLiked = liked;
    const nextLiked = !previousLiked;

    setLiked(nextLiked);
    setIsPending(true);

    try {
      await request(nextLiked);
    } catch {
      setLiked(previousLiked);
    } finally {
      setIsPending(false);
    }
  };

  return { liked, isPending, toggle };
}
