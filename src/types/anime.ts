
export interface SearchResult {
  animeId: string;
  animeTitle: string;
  animeImg: string;
  releasedDate: string;
  animeUrl: string;
}

export interface Episode {
  episodeId: string;
  episodeNum: string;
  episodeUrl: string;
}

export interface AnimeDetails {
  animeTitle: string;
  type: string;
  releasedDate: string;
  status: string;
  genres: string[];
  otherNames: string;
  synopsis: string;
  animeImg: string;
  totalEpisodes: string;
  episodesList: Episode[];
}

export interface EpisodeSource {
    headers: {
        Referer: string;
    },
    sources: {
        url: string;
        isM3U8: boolean;
        quality: string;
    }[];
    download: string;
}

// Combining for a more unified type if needed
export interface Anime extends SearchResult {
    details?: AnimeDetails;
}
