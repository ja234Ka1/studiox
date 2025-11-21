export type MediaType = "movie" | "tv";
export type TimeRange = "day" | "week";

export interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  media_type: MediaType;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
}

export interface Movie extends Media {
  media_type: "movie";
  title: string;
  release_date: string;
}

export interface TVShow extends Media {
  media_type: "tv";
  name: string;
  first_air_date: string;
}

export interface ApiResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Video {
    iso_639_1: string;
    iso_3166_1: string;
    name: string;
    key: string;
    site: string;
    size: number;
    type: string;
    official: boolean;
    published_at: string;
    id: string;
}
