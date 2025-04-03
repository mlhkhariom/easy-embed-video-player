import { Movie, TvShow } from '@/types';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = process.env.REACT_APP_TMDB_API_URL || 'https://api.themoviedb.org/3';

interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface Genre {
  id: number;
  name: string;
}

interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
}

interface Episode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
  vote_average: number;
  vote_count: number;
}

interface Network {
  name: string;
  id: number;
  logo_path: string;
  origin_country: string;
}

interface ProductionCompany {
  name: string;
  id: number;
  logo_path: string | null;
  origin_country: string;
}

interface ExternalIDs {
  imdb_id: string;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
  id: number;
}

interface CreditsResponse {
  id: number;
  cast: Cast[];
  crew: Crew[];
}

interface Cast {
  adult: boolean;
  gender: number | null;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  character: string;
  credit_id: string;
  order: number;
}

interface Crew {
  adult: boolean;
  gender: number | null;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

export interface Movie {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  runtime: number;
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
  production_companies: ProductionCompany[];
  imdb_id?: string;
  homepage?: string;
  media_type?: string;
}

// Update the TvShow interface to include country if needed
export interface TvShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  first_air_date: string;
  last_air_date: string;
  status: string;
  genres: Genre[];
  number_of_episodes: number;
  number_of_seasons: number;
  seasons: Season[];
  episode_run_time: number[];
  networks: Network[];
  production_companies: ProductionCompany[];
  origin_country: string[];
  original_language: string;
  popularity: number;
  imdb_id?: string;
  homepage?: string;
  // Added for type safety
  title?: string; 
  media_type?: string;
  release_date?: string;
}

export const getTrendingMovies = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getPopularMovies = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getTopRatedMovies = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getUpcomingMovies = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getMovieDetails = async (movieId: number): Promise<Movie> => {
  const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getMovieExternalIds = async (movieId: number): Promise<ExternalIDs> => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/external_ids?api_key=${API_KEY}`);
     if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    return response.json();
};

export const getRelatedMovies = async (movieId: number, page: number = 1): Promise<TMDBResponse<Movie>> => {
  const response = await fetch(`${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&language=en-US&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getTrendingTvShows = async (page = 1): Promise<TMDBResponse<TvShow>> => {
  const response = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getPopularTvShows = async (page = 1): Promise<TMDBResponse<TvShow>> => {
  const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getTopRatedTvShows = async (page = 1): Promise<TMDBResponse<TvShow>> => {
  const response = await fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getTvShowDetails = async (tvId: number): Promise<TvShow> => {
  const response = await fetch(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}&language=en-US`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getTvShowCredits = async (tvId: number): Promise<CreditsResponse> => {
  const response = await fetch(`${BASE_URL}/tv/${tvId}/credits?api_key=${API_KEY}&language=en-US`);
   if (!response.ok) {
       throw new Error(`API request failed with status ${response.status}`);
   }
   return response.json();
};

export const getTvExternalIds = async (tvId: number): Promise<ExternalIDs> => {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/external_ids?api_key=${API_KEY}`);
     if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    return response.json();
};

export const getSeasonDetails = async (tvId: number, seasonNumber: number): Promise<{ id: number; episodes: Episode[] }> => {
  const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=en-US`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getRelatedTvShows = async (tvId: number, page: number = 1): Promise<TMDBResponse<TvShow>> => {
  const response = await fetch(`${BASE_URL}/tv/${tvId}/recommendations?api_key=${API_KEY}&language=en-US&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const searchMovies = async (query: string, page: number = 1): Promise<TMDBResponse<Movie>> => {
  const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${query}&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const searchTvShows = async (query: string, page: number = 1): Promise<TMDBResponse<TvShow>> => {
  const response = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&language=en-US&query=${query}&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getGenres = async (): Promise<{ genres: Genre[] }> => {
  const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getMoviesByGenre = async (genreId: number, page: number = 1): Promise<TMDBResponse<Movie>> => {
  const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getTvShowsByGenre = async (genreId: number, page: number = 1): Promise<TMDBResponse<TvShow>> => {
  const response = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

// Add these Web Series functions to fix imports
export const getWebSeries = async (page = 1): Promise<TMDBResponse<TvShow>> => {
  const response = await fetch(
    `${process.env.REACT_APP_TMDB_API_URL || 'https://api.themoviedb.org/3'}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}&with_genres=10759,10765&without_genres=16,10762`
  );
  
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  
  return response.json();
};

export const isWebSeries = (genre_ids: number[]): boolean => {
  // Web series typically have action/adventure (10759) or sci-fi/fantasy (10765) genres
  // and exclude animation (16) and kids (10762)
  return (
    (genre_ids.includes(10759) || genre_ids.includes(10765)) && 
    !genre_ids.includes(16) && 
    !genre_ids.includes(10762)
  );
};

// Fix the getContentByCountry function to handle country data properly
export const getContentByCountry = async (
  country: string = 'global', 
  type: 'movie' | 'tv' = 'movie', 
  page: number = 1
): Promise<TMDBResponse<any>> => {
  let url = '';
  const region = country === 'global' ? '' : `&region=${country.toUpperCase()}`;
  
  if (type === 'movie') {
    url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}${region}&with_original_language=${getLanguageByCountry(country)}`;
  } else {
    url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}${region}&with_original_language=${getLanguageByCountry(country)}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  
  return response.json();
};

// Helper function to get language code by country
function getLanguageByCountry(country: string): string {
  switch (country) {
    case 'in':
      return 'hi';
    case 'uk':
      return 'en';
    case 'us':
      return 'en';
    default:
      return 'en';
  }
}
