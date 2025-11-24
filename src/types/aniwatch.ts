
export interface AniWatchMedia {
  id: string;
  name: string;
  poster: string;
  jname: string;
  other_name: string;
}

export interface AniWatchAPIResponse<T> {
  results: T[];
}

export interface AniWatchEpisode {
  id: string;
  number: number;
  title: string;
  is_filler: boolean;
}

export interface AniWatchDetails extends AniWatchMedia {
    description: string;
    type: string;
    status: string;
    episodes: AniWatchEpisode[];
}
