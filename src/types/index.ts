export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: Genre[];
  runtime?: number;
  imdb_id?: string;
  name?: string; // For compatibility with search results
}

export interface TvShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: Genre[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: Season[];
  imdb_id?: string;
  title?: string; // For compatibility with search results
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string;
  overview: string;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  name: string;
  episode_number: number;
  season_number: number;
  overview: string;
  still_path: string;
  air_date: string;
  vote_average: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface TvResponse {
  page: number;
  results: TvShow[];
  total_pages: number;
  total_results: number;
}

export interface MultiSearchResponse {
  page: number;
  results: (Movie | TvShow)[];
  total_pages: number;
  total_results: number;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Credits {
  id: number;
  cast: Cast[];
}

export interface AdminSettings {
  siteName: string;
  siteDescription: string;
  primaryColor: string;
  logoUrl: string;
  enableLiveTV: boolean;
  enableAutoPlay: boolean;
  enable3DEffects: boolean;
  tmdbApiKey: string;
  customCSS: string;
  featuredContent: {
    movie: number | null;
    tvShow: number | null;
  };
}

export interface AdminUser {
  email: string;
  password: string;
  name: string;
}

export interface LiveTVCategory {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export interface LiveTVSettings {
  categories: LiveTVCategory[];
  featuredChannels: string[];
}
