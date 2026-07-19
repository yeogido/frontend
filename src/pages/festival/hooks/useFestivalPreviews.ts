import {
  featuredFestival,
  ongoingFestivalPreviews,
  recentFestivalPreviews,
} from '../constants/festivals';

function useFestivalPreviews() {
  return {
    featuredFestival,
    ongoingFestivals: ongoingFestivalPreviews,
    recentFestivals: recentFestivalPreviews,
  };
}

export default useFestivalPreviews;
