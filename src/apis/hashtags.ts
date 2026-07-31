import { apiClient } from './common';

export interface Hashtag {
  id: number;
  name: string;
}

export async function fetchHashtags(): Promise<Hashtag[]> {
  // apiClient's response interceptor already unwraps the envelope.
  const { data } = await apiClient.get<Hashtag[]>('/hashtags');

  return data;
}
