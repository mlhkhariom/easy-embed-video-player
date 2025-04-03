// src/types/index.ts

export interface AdminUser {
  email: string;
  password: string;
  name: string;
}

export interface AdminSettings {
  siteName: string;
  siteDescription: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  sidebarBackgroundColor: string;
  logoUrl: string;
  enableLiveTV: boolean;
  enableAutoPlay: boolean;
  enable3DEffects: boolean;
  enableTrending: boolean;
  enableCloudStream: boolean;
  selectedCountry: SupportedCountry;
  tmdbApiKey: string;
  customCSS: string;
  featuredContent: {
    movie: number | null;
    tvShow: number | null;
  };
  playerSettings: {
    defaultQuality: string;
    autoplay: boolean;
    preload: boolean;
    subtitlesEnabled: boolean;
    defaultSubtitleLanguage: string;
    playbackSpeed: number;
  };
}

export interface PlayerSettings {
  defaultQuality: 'auto' | '1080p' | '720p' | '480p' | '360p';
  autoplay: boolean;
  preload: boolean;
  subtitlesEnabled: boolean;
  defaultSubtitleLanguage: string;
  playbackSpeed: number;
}

export interface LiveTVCategory {
  id: string;
  name: string;
  order: number;
  icon: string;
  isEnabled: boolean;
}

export interface M3UData {
  url: string;
  name: string;
  channels: Channel[];
}

export interface Channel {
  id: string;
  name: string;
  country?: string;
  subdivision?: string;
  city?: string;
  broadcast_area?: string[];
  languages?: string[];
  categories?: string[];
  is_nsfw?: boolean;
  website?: string;
  logo?: string;
  url?: string;
  category?: string;
  language?: string;
}

export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  status?: string;
  tagline?: string;
  budget?: number;
  revenue?: number;
  imdb_id?: string;
  videos?: {
    results: Video[];
  };
  images?: {
    backdrops: Image[];
    posters: Image[];
  };
  credits?: Credits;
  country?: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface TvShow {
  id: number;
  name: string;
  original_name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: Genre[];
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time?: number[];
  status?: string;
  tagline?: string;
  type?: string;
  imdb_id?: string;
  show_type?: 'tv_serial';
  original_language?: string;
  languages?: string[];
  networks?: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
  seasons?: Season[];
  videos?: {
    results: Video[];
  };
  images?: {
    backdrops: Image[];
    posters: Image[];
  };
  credits?: Credits;
}

export interface TvResponse {
  page: number;
  results: TvShow[];
  total_pages: number;
  total_results: number;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  air_date?: string;
  episode_count: number;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date?: string;
  vote_average: number;
  vote_count: number;
  runtime?: number;
  crew?: Crew[];
  guest_stars?: Cast[];
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface Image {
  aspect_ratio: number;
  file_path: string;
  height: number;
  width: number;
  vote_average: number;
  vote_count: number;
}

export type SupportedCountry = 'global' | 'us' | 'in' | 'uk';

export interface CountryOption {
  id: SupportedCountry;
  name: string;
  flag: string;
  region: string;
  language: string;
}

export interface CloudStreamContent {
  id: string;
  title: string;
  year?: number;
  posterUrl: string;
  backdropUrl?: string;
  type: 'movie' | 'tvshow';
  source_id: string;
  url: string;
  created_at: string;
  updated_at: string;
  poster?: string;
  source?: string;
}

export interface CloudStreamPlugin {
  id?: string;
  name: string;
  url: string;
  version?: string;
  description?: string;
  author?: string;
  repository?: string;
  categories?: string[];
  language?: string;
  isEnabled?: boolean;
  isInstalled?: boolean;
  internalName?: string;
  iconUrl?: string;
}

export interface CloudStreamRepo {
  id?: string;
  name: string;
  url: string;
  description?: string;
  author?: string;
  isEnabled?: boolean;
  pluginCount?: number;
}
